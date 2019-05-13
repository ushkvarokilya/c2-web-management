import { Component, OnInit } from '@angular/core';
import { UserService } from '../../services/user.service';
import { StringValidationService } from '../../services/string-validation.service';
import { Http, Response, Headers } from '@angular/http';
import { environment } from "../../../environments/environment";

@Component({
  selector: 'app-forgot-password',
  templateUrl: './forgot-password.component.html',
  styleUrls: ['./forgot-password.component.scss']
})
export class ForgotPasswordComponent implements OnInit {

  email: string

  loading = false

  emailSent = false

  errorInEmail = '';

  environment = environment;

  constructor(
    private userService: UserService,
    private stringValidation: StringValidationService,
    private http: Http
  ) { }

  ngOnInit() {
  }

  sendEmail() {
    if (this.stringValidation.isValidEmail(this.email)){
      this.loading = true
      var headers = new Headers();
      headers.append('Content-Type', 'application/json; charset=utf-8');
      var json = JSON.stringify({ email:this.email});
      this.http.post(this.environment.accounting_api_endpoint + 'Users/reset/manager', json, { headers: headers })
      .subscribe((res: Response) => {
        const data = res.json();
        // if(data.status){
        //   this.emailSent = true;
        //   setTimeout(() => location.replace('/login'), 3000);
        // }else{
          this.errorInEmail = data.message;
          this.loading = false;
          this.email = '';
        // }
      });

      // this.userService.sendResetPasswordEmail(this.email)
      //   .then(() => {
      //     this.emailSent = true
      //   }).catch((err) => {
      //     this.errorInEmail = err.message;
      //     this.loading = false;
      //     this.email = '';
      //   });
    }
    else {
      this.errorInEmail = 'Invalid Email: ' + this.email;
      this.email = '';
    }
  }

}
