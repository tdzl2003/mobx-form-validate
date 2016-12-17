Validation Helper for form in Mobx
==================================

## Installation

```bash
npm i mobx-form-validate --save
```

## API

### @validate(regexp[, message])
### @validate((value, this)=>string|undefined)

Use this decorator on your properties, which must be aslo decorated by @observable or @computed.

This will add a hidden `@computed` field named with 'validateError' prefix in camel-case, 
which should be undefined when validation successed, or be a string which indicate error message.

This will also add a computed field named 'validateError', which indicate any error occuered in this form.

This will also add a computed field named 'isValid', whether this form has no validation error.

## Usage

### Create a observable class with validation

```js
import {observable, computed} from 'mobx';
import validate from 'mobx-form-validate';
import Session from '../../../logics/session';

export default class LoginForm {
  @observable
  @validate(/^1\d{10}$/, 'Please enter a valid mobile')
  mobile = '';

  @observable
  @validate(/^.+$/, 'Please enter any password')
  pwd = '';

  // Bind this for future use.
  submit = () => {
    return Session.login(this, 'user');
  }
}

const form = new LoginForm();
console.log(form.validateErrorMobile);  // Please enter a valid mobile
console.log(form.validateError);        // Please enter a valid mobile
console.log(form.isValid);              // false

```

### Use with react
 
```js
import React from 'react';
import { observer } from 'mobx-react'; 
import LoginForm from './LoginForm';

@observer
export default class Login extends React.Component {
  form = new LoginForm();
  render() {
    return (
      <div>
        <p>Mob: <input value={this.form.mobile} onChange={ev=>this.form.mobile = ev.target.value}/></p>
        <p>{this.form.validateErrorMobile}</p>
        <p>Pwd: <input type="password" value={this.form.pwd} onChange={ev=>this.form.pwd = ev.target.value}/></p>
        <p>{this.form.validateErrorPwd}</p>
        <button disabled={!this.form.isValid} onClick={this.form.submit}>Submit</button>
      </div>
    )
  }
}
```

### Use with react-native

Just replace all html element with react-native components.

```js
import React from 'react';
import { observer } from 'mobx-react';
import { View, Text, TextInput, TouchableOpacity } from 'react-native';
import LoginForm from './LoginForm';

@observer
export default class Login extends React.Component {
  form = new LoginForm();
  render() {
    return (
      <View>
        <View><Text>Mob:</Text> <TextInput value={this.form.mobile} onChangeText={text=>this.form.mobile = text}/></View>
        <View>{this.form.validateErrorMobile}</View>
        <View><Text>Pwd:</Text> <TextInput type="password" value={this.form.pwd} onChangeText={text=>this.form.pwd = text}/></View>
        <View>{this.form.validateErrorPwd}</View>
        <TouchableOpacity disabled={!this.form.isValid} onPress={this.form.submit}><Text>Submit</Text></button>
      </View>
    )
  }
}
```

### Custom valid condition

You can define your own `isValid` getter, with any additional condition:

```js
class MyForm {
  startAt = new Date();
  
  @computed
  get isValid() {
    // This form is only submittable after 10 seconds.
    return !this.validateError && new Date() - this.startAt > 10000; 
  ]
}
```

### Optimize

To avoid re-render of the whole form, you can create a item component to observe
 a single field:

```js
import React from 'react';
import { observer } from 'mobx-react'; 
import LoginForm from './LoginForm';
import camelCase from 'camelcase';

// Only re-render when this field changes.
const Input = observer(function Input({label, form, name, ...others}){
  return (
    <p>
        <input value={form[name]} onChange={ev=>form[name]=ev.target.value} {...others}/>
        {form[camelCase('validateError', name)]}
    </p>
  )
});

// Only re-render when the whole form become valid or invalid.
const Submit = observer(function Submit({form, children}){
  return <button disabled={!form.isValid} onClick={this.form.submit}>{children}</button>
});

// Do not re-render.
export default class Login extends React.Component {
  form = new LoginForm();
  render() {
    return (
      <div>
        <Input label="Mob:" name="mobile" form={this.form} />
        <Input label="Pwd:" name="pwd" form={this.form} type="password"/>
        <Submit form={this.form}>Submit</Submit>
      </div>
    )
  }
}
```

### Sub-form

You can create sub-form or even sub-form list in your form:

```js
class SubForm {
  @observable
  @validate(/.+/)
  field1 = '';
  
  @observable
  @validate(/.+/)
  field2 = '';
}

class Item {
  @observable
  @validate(/.+/)
  field3 = '';
}

class MainForm {
  @observable
  haveSubForm = false;
    
  @observable
  @validate((value, this)=>this.haveSubForm && value.validationError)
  subForm = new SubForm();
  
  @observable
  @validate((value) => value.map(v=>v.validationError).find(v=>v))
  itemList = [];
  
  @action
  addItem() {
    this.itemList.push(new Item());
  }
  
  @action
  clearItem() {
    this.itemList.clear();
  }
}
```
