import { Component, OnInit } from '@angular/core';
import { UserService } from '../../services/user.service';
import { StringValidationService } from '../../services/string-validation.service';

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

  constructor(
    private userService: UserService,
    private stringValidation: StringValidationService
  ) { }

  ngOnInit() {
  }

  sendEmail() {
    if (this.stringValidation.isValidEmail(this.email)){
      this.loading = true
      this.userService.sendResetPasswordEmail(this.email)
        .then(() => {
          this.emailSent = true
        }).catch((err) => {
          this.errorInEmail = err.message;
          this.loading = false;
          this.email = '';
        })
    }
    else {
      this.errorInEmail = 'Invalid Email: ' + this.email;
      this.email = '';
    }
  }

}
