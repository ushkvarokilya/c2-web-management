import { Component, OnInit } from '@angular/core';
import { select, NgRedux } from '@angular-redux/store';
import { UserService } from '../../services/user.service';
import { AppState } from '../../store/appState';
import { Observable } from 'rxjs/Observable';
import { User } from '../../store/user/user.interface';
import { StringValidationService } from '../../services/string-validation.service';

@Component({
	selector: 'account-details',
	templateUrl: './account-details.component.html',
	styleUrls: ['./account-details.component.scss']
})

export class AccountDetailsComponent implements OnInit {

	user: Observable<User>;

	email;

	emailError;
	loadingEmail;
	emailChanged;

	oldPassword;
	newPassword;
	repeatNewPassword;

	passwordError;
	loadingPassword;
	passwordChanged;

	constructor(
		private userService: UserService, 
		private redux: NgRedux<AppState>,
		private stringValidation: StringValidationService
	) { }

	ngOnInit() {
		this.user = this.redux.select(state => state.user)
	}

	changeEmail() {
		let emailValid = this.stringValidation.isValidEmail(this.email)
		if (this.email && this.email.length > 0 && emailValid) {
			this.loadingEmail = true;
			this.userService.managerChangeEmail(this.email)
				.then(_ => {
					this.loadingEmail = false;
					this.emailChanged = true;
				}, err => {
					this.emailError = "Server error"
					this.loadingEmail = false;
				})
		} else {
			this.emailError = "Email isn't valid"
		}
	}

	changePassword() {
		if ((this.oldPassword && this.oldPassword.length > 0) &&
			(this.newPassword && this.newPassword.length > 0) &&
			(this.repeatNewPassword && this.repeatNewPassword.length > 0)){
				if(this.newPassword === this.repeatNewPassword){
					this.loadingPassword = true;
					this.userService.changePassword(this.oldPassword, this.newPassword)
					.then(() => {
						this.loadingPassword = false;
						this.passwordChanged = true;
					}, err => {
						this.loadingPassword = false;
						this.passwordError = err.message;
					})
				}else{
					this.passwordError = "Passwords does not match"
				}
			}else{
				this.passwordError = "One or more of passwords aren't valid"
			}
	}

}