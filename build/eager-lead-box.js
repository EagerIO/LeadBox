(function() {
    "use strict";
    function email$utils$utils$$submit(options, email, callback) {
      if (options.destination == 'email' && options.email) {
        email$utils$utils$$submitFormspree(email, callback);
      } else if (options.destination == 'service') {
        if (options.account.service == 'mailchimp') {
          email$utils$utils$$submitMailchimp(email, callback);
        } else if (options.account.service == 'constant-contact') {
          email$utils$utils$$submitConstantContact(email, callback);
        }
      }
    }

    function email$utils$utils$$submitFormspree(email, cb) {
      var url, xhr, params;

      url = '//formspree.io/' + options.email;
      xhr = new XMLHttpRequest();

      params = 'email=' + encodeURIComponent(email);

      xhr.open('POST', url);
      xhr.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
      xhr.setRequestHeader('Accept', 'application/json');
      xhr.onload = function() {
        var jsonResponse = {};
        if (xhr.status < 400) {
          try {
            jsonResponse = JSON.parse(xhr.response);
          } catch (err) {}

          if (jsonResponse && jsonResponse.success === 'confirmation email sent') {
            cb('Formspree has sent an email to ' + options.email + ' for verification.');
          } else {
            cb(true);
          }
        } else {
          cb(false);
        }
      }

      xhr.send(params);
    }function email$utils$utils$$submitMailchimp(email, cb) {
      var cbCode, url, script;

      cbCode = 'eagerFormCallback' + Math.floor(Math.random() * 100000000000000);

      window[cbCode] = function(resp) {
        cb(resp && resp.result === 'success');

        delete window[cbCode];
      }

      url = options.list;
      if (!url) {
        return cb(false);
      }

      url = url.replace('http', 'https');
      url = url.replace(/list-manage[0-9]+\.com/, 'list-manage.com');
      url = url.replace('?', '/post-json?');
      url = url + '&EMAIL=' + encodeURIComponent(email);
      url = url + '&c=' + cbCode;

      script = document.createElement('script');
      script.src = url;
      document.head.appendChild(script);
    }function email$utils$utils$$submitConstantContact(email, cb) {
      if (!options.form || !options.form.listId) {
        return cb(false);
      }

      var xhr, body;

      xhr = new XMLHttpRequest();

      body = {
        email: email,
        ca: options.form.campaignActivity,
        list: options.form.listId
      };

      xhr.open('POST', 'https://visitor2.constantcontact.com/api/signup');
      xhr.setRequestHeader('Content-type', 'application/json');
      xhr.setRequestHeader('Accept', 'application/json');
      xhr.onload = function() {
        cb(xhr && xhr.status < 400);
      };

      xhr.send(JSON.stringify(body));
    }

    (function(){
      if (!window.addEventListener || !document.documentElement.setAttribute || !document.querySelector || !document.documentElement.classList) {
        return
      }

      var options, isPreview, style, el, form, show, hide, checkScroll, updateStyle, updateCopy, update, setOptions;

      options = INSTALL_OPTIONS;
      isPreview = INSTALL_ID == 'preview';

      style = document.createElement('style');
      document.head.appendChild(style);

      updateStyle = function() {
        style.innerHTML = '' +
        ' .eager-lead-box .eager-lead-box-button {' +
        '   background: ' + options.color + ' !important' +
        ' }' +
        ' .eager-lead-box input.eager-lead-box-input:focus {' +
        '   border-color: ' + options.color + ' !important;' +
        '   box-shadow: 0 0 .0625em ' + options.color + ' !important' +
        ' }' +
        '';
      };

      el = document.createElement('eager-lead-box');
      el.addEventListener('touchstart', function(){}, false); // iOS :hover CSS hack
      el.className = 'eager-lead-box';
      el.innerHTML = '' +
      ' <div class="eager-lead-box-close-button"></div>' +
      ' <div class="eager-lead-box-content">' +
      '   <div class="eager-lead-box-header"></div>' +
      '   <div class="eager-lead-box-body"></div>' +
      '   <form class="eager-lead-box-form">' +
      '     <div class="eager-lead-box-field">' +
      '       <input name="email" class="eager-lead-box-input" type="email" placeholder="Email address" spellcheck="false" required>' +
      '     </div>' +
      '     <div class="eager-lead-box-actions">' +
      '       <button type="submit" class="eager-lead-box-button"></button>' +
      '     </div>' +
      '   </form>' +
      ' </div>' +
      ' <div class="eager-lead-box-branding">' +
      '   <a class="eager-lead-box-branding-link" href="https://eager.io?utm_source=eager_lead_box_powered_by_link" target="_blank">Powered by Eager</a>' +
      ' </div>' +
      '';

      updateCopy = function() {
        el.querySelector('.eager-lead-box-header').innerHTML = options.headerText;
        el.querySelector('.eager-lead-box-body').innerHTML = options.bodyText;
        el.querySelector('.eager-lead-box-button').innerHTML = options.buttonText || '&nbsp;';
      };

      update = function() {
        if (!document.body){
          return;
        }

        if (!form.parentNode){
          el.querySelector('.eager-lead-box-content').appendChild(form);
        }

        el.querySelector('button[type="submit"]').removeAttribute('disabled');

        updateCopy();
        updateStyle();
      };

      setOptions = function(opts) {
        options = opts;

        update();
      };

      form = el.querySelector('.eager-lead-box-form');
      form.addEventListener('submit', function(event){
        event.preventDefault();

        var header, body, button, email, callback;

        header = el.querySelector('.eager-lead-box-header');
        body = el.querySelector('.eager-lead-box-body');
        button = el.querySelector('button[type="submit"]');
        email = el.querySelector('input[type="email"]').value;

        if (isPreview) {
          form.parentNode.removeChild(form);
          header.innerHTML = options.successText;
          body.innerHTML = '(Form submissions are simulated during the Eager preview.)';
          return;
        }

        callback = function(ok) {
          button.removeAttribute('disabled');

          if (ok) {
            form.parentNode.removeChild(form);

            if (typeof ok == 'string') {
              body.innerHTML = ok;
            } else {
              body.parentNode.removeChild(body);
              header.innerHTML = options.successText;
            }

            setTimeout(hide, 3000);
          } else {
            body.innerHTML = 'Whoops, something didn’t work. Please try again.';
          }
        };

        email$utils$utils$$submit(options, email, callback);

        button.setAttribute('disabled', 'disabled');
      });

      show = function() {
        el.classList.add('eager-lead-box-show');
        el.classList.remove('eager-lead-box-hide');
      };

      hide = function() {
        el.classList.add('eager-lead-box-hide');
        el.classList.remove('eager-lead-box-show');
      };
      el.querySelector('.eager-lead-box-close-button').addEventListener('click', hide);

      checkScroll = function() {
        if (!document.body) {
          return;
        }

        if ((window.innerHeight + window.scrollY) >= document.body.offsetHeight) {
          show();

          if (!isPreview) {
            window.removeEventListener('scroll', checkScroll);
          }
        }
      };
      window.addEventListener('scroll', checkScroll);

      if (isPreview) {
        show();
      }

      document.addEventListener('DOMContentLoaded', function(){
        document.body.appendChild(el);

        update();
      });

      window.EagerLeadBox = {
        setOptions: setOptions,
        hide: hide,
        show: show
      };
    })();
}).call(this);