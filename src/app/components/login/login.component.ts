import { Component, OnInit } from '@angular/core';

import { UserService } from '../../services/user.service';
import { NgRedux } from '@angular-redux/store';
import { AppState } from '../../store/appState';
import { Router } from '@angular/router/src/router';

import { environment } from "../../../environments/environment";
import { Http, Response, Headers } from '@angular/http';

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

  environment = environment

  constructor(
    private userService: UserService,
    private redux: NgRedux<AppState>,
    private http: Http
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

    // this.userService.login(this.email, this.password)
    //   .then((user: any) => {
    //     localStorage.setItem('user_bridge', JSON.stringify({ token: user.token, key: user.key }));
    //     location.replace('/overview')
    //   }, (err) => {
    //     this.loading = false;
    //     this.error = 'Invalid email or password';
    //     if (!this.error) {
    //       this.isRegistrationSucsessful = true;
    //     }
    //   })

    var headers = new Headers();
    headers.append('Content-Type', 'application/json; charset=utf-8');
    var json = JSON.stringify({ email:this.email, password:this.password });
    this.http.post(this.environment.accounting_api_endpoint + 'Users/login/manager', json, { headers: headers })
    .subscribe((res: Response) => {
      const user = res.json();
      if(user.key !== undefined){
        localStorage.setItem('user_bridge', JSON.stringify({ token: user.token, key: user.key }));
        this.isRegistrationSucsessful = true;
        location.replace('/overview');
      }else{
        this.loading = false;
        this.error = user.message;
      }
    });

  }

}
