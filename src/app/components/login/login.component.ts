import { Component, OnInit } from '@angular/core';

import { UserService } from '../../services/user.service';
import { NgRedux } from '@angular-redux/store';
import { AppState } from '../../store/appState';
import { Router } from '@angular/router/src/router';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})

export class LoginComponent implements OnInit {
  email: string;
  password: string;
  errorMessage: string = '';
  showStyle: boolean = false;
  loading = false;
  error;

  // isIPhon = false;
  // isAndroid = false;
  // isWindows = false

  inputValidStatus = {
    email: true,
    password: true
  };

  isRegistrationSucsessful = false;


  constructor(
    private userService: UserService,
    private redux: NgRedux<AppState>
  ) {
  }

  ngOnInit() {
  }

  submitForm(value) {
    this.login()
  }

  login() {
    if (this.loading) return;
    delete this.error;
    if (!this.email || this.email.length == 0) {
      this.inputValidStatus.email = false;
      return;
    }
    this.inputValidStatus.email = true;
    if (!this.password || this.password.length == 0) {
      this.inputValidStatus.password = false;
      return;
    }
    this.inputValidStatus.password = true;
    this.loading = true;
    this.userService.login(this.email, this.password)
      .then((user: any) => {
        localStorage.setItem('user_bridge', JSON.stringify({ token: user.token, key: user.key }));
        location.replace('/overview')
      }, (err) => {
        this.loading = false;
        this.error = 'Invalid email or password';
        if (!this.error) {
          this.isRegistrationSucsessful = true;
        }
      })
  }

}
