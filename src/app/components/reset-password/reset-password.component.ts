import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { UserService } from '../../services/user.service';

@Component({
  selector: 'app-reset-password',
  templateUrl: './reset-password.component.html',
  styleUrls: ['./reset-password.component.scss']
})
export class ResetPasswordComponent implements OnInit {

  token: string

  passwordForm = new FormGroup({
    password: new FormControl('', [Validators.required, Validators.minLength(6)]),
    passwordRepeat: new FormControl('', [Validators.required])
  })

  loading = false
  notMatchingPassword
  passwordReset = false

  error

  constructor(private activatedRoute: ActivatedRoute,
    private userService: UserService) { }

  ngOnInit() {
    this.activatedRoute.queryParams
      .subscribe(params => {
        this.token = params.token
      })
  }

  resetPassword() {
    let password = this.passwordForm.get("password").value as string
    let passwordRepeat = this.passwordForm.get("passwordRepeat").value as string
    this.notMatchingPassword = false
    this.error = false
    if (password === passwordRepeat) {
      this.loading = true
      let isManager = window.location.toString().includes("manager");
      if(isManager){
        this.token = this.token.substring(0, this.token.indexOf("/manager"));
      }else{
        this.token = this.token.substring(0, this.token.indexOf("/tenant"));
      }
      this.userService.resetPasswordWithToken(this.token, password, isManager)
      //this.userService.resetPasswordWithToken(this.token, password, false)
        .then(() => {
          this.passwordReset = true
        })
        .catch(_ => {
          this.loading = false
          this.error = true
        })
    } else {
      this.notMatchingPassword = true
    }
  }

}
