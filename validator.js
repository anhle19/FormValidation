function Validator(options) {

  function getParent(element, selector) {
    while (element.parentElement) {
      if(element.parentElement.matches(selector)) {
          return element.parentElement
      }
      element = element.parentElement
    }
  }

  var selectorRules = {};
  //Phương thức dùng để xác thực các thông tin nhập vào
  //Hiển thị message lỗi cho từng rule ứng với mỗi element
  function validate(inputElement, rule) {
    //Nhận vào một element
    var errorElement = getParent(inputElement, options.formGroupSelector).querySelector(
      options.errorSelector
    );

    //Lấy ra các rule của selector
    var rules = selectorRules[rule.selector];
    var errorMessage = ''
    //Lặp qua từng rule và kiểm tra
    //Nếu có lỗi thì dừng việc kiểm tra
    for (var i = 0; i < rules.length; i++) {
      switch(inputElement.type) {
        case 'checkbox':
        case 'radio':
          errorMessage = rules[i](
            formElement.querySelector(rule.selector + ':checked')
          )
          break
        default:
          errorMessage = rules[i](inputElement.value);
      }
      if (errorMessage) break;
    }

    if (errorMessage) {
      errorElement.innerText = errorMessage;
      getParent(inputElement, options.formGroupSelector).classList.add("invalid");
    } else {
      errorElement.innerText = "";
      getParent(inputElement, options.formGroupSelector).classList.remove("invalid");
    }
    return !errorMessage
  }

  //Lấy element của form cần validate
  var formElement = document.querySelector(options.form);

  if (formElement) {

    //Khi bấm nút submit thì bỏ qua hành động mặc định
    formElement.onsubmit = function (e) {
      e.preventDefault()

      var isFormValid = true
      //Lặp qua tất cả các rule để kiểm tra
      options.rules.forEach(function (rule) {
        var inputElement = formElement.querySelector(rule.selector)
        var isValid = validate(inputElement, rule)

        if(!isValid) {
          isFormValid = false
        }
      })

      if(isFormValid) {
        if(typeof options.submit === 'function') {
          
          //Lấy ra các tất cả các thẻ input
          var enableInput = formElement.querySelectorAll('[name]')
          //Lặp qua tất cả các thẻ input để lấy giá trị cho formValue
          //Kiểm tra thẻ nhập vào có phải checkbox hoặc radio
          var formValue = Array.from(enableInput).reduce(function (values, input) {
            switch(input.type) {
              case 'checkbox':
              case 'radio':
                values[input.name] = formElement.querySelector('input[name="' + input.name + '"]:checked').value
                break
              case 'file':
                values[input.name] = input.files
                break
              default:
                values[input.name] = input.value
            }
            return values
          }, {})

          //Gọi hàm submit với giá trị formvalue
          options.submit(formValue)
        }
      }
    
    };

    //Lặp tất cả các rules
    //Xử lý lắng nghe sự kiện
    options.rules.forEach(function (rule) {
      if (Array.isArray(selectorRules[rule.selector])) {
        selectorRules[rule.selector].push(rule.test);
      } else {
        selectorRules[rule.selector] = [rule.test];
      }

      //Lấy ra element selector của mỗi rule
      var inputElements = formElement.querySelectorAll(rule.selector);
      Array.from(inputElements).forEach(function (inputElement) {
        if (inputElement) {
          //Xử lý trường hợp blur khỏi input
          inputElement.onblur = function () {
            validate(inputElement, rule);
          };
  
          //Xử lý trường hợp khi người dùng nhập vào input
          inputElement.oninput = function () {
            var errorElement = getParent(inputElement, options.formGroupSelector).querySelector(
              options.errorSelector
            );
            errorElement.innerText = "";
            getParent(inputElement, options.formGroupSelector).classList.remove("invalid");
            validate(inputElement, rule);
          };
        }
      })
      
    });
  }
}

//Kiểm tra người dùng có nhập đủ hay không
Validator.isRequired = function (selector, message) {
  return {
    selector: selector,
    test: function (value) {
      return value ? undefined : message;
    },
  };
};

//Kiểm tra email của người dùng
Validator.isEmail = function (selector) {
  return {
    selector: selector,
    test: function (value) {
      //Biểu thức chính qui để kiểm tra email
      var regex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
      return regex.test(value) ? undefined : "Trường này phải là email";
    },
  };
};

Validator.minLength = function (selector, min) {
  return {
    selector: selector,
    test: function (value) {
      return value.length >= min
        ? undefined
        : `Vui lòng nhập tối thiểu ${min} kí tự`;
    },
  };
};

Validator.isConfirmed = function (selector, getConfirmedValue, message) {
  return {
    selector: selector,
    test: function (value) {
      return value === getConfirmedValue() ? undefined : message;
    },
  };
};
