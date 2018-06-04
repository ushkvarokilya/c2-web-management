import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { NgRedux, select } from '@angular-redux/store';
import { Subject, Observable, Subscription } from 'rxjs';
import { User } from '../../../store/user/user.interface';
import { AppState } from '../../../store/appState';
import { CompanyService } from '../../../services/company.service';
import { StringValidationService } from '../../../services/string-validation.service';
import { filter, takeWhile } from 'rxjs/operators';

@Component({
	selector: 'app200-users-and-roles',
	templateUrl: './users-and-roles.component.html',
	styleUrls: ['./users-and-roles.component.scss'],
	host: {
		'(document:click)': 'onDocumentClick($event)',
	}
})

export class UsersAndRolesComponent implements OnInit, UsersAndRoles {

	@Input() doNext: Subject<string>;
	@Input() nextName: string;
	@Output() doneNext = new EventEmitter<{ users: UsersAndRoles } | { [key: string]: boolean }>()
	@Output() exposeUsers = new EventEmitter<{ users: UsersAndRoles }>()

	@select() user$: Observable<User>;
	userObserver: Subscription;

	permissions = [
		"Setup",
		"Facility",
		"Calendar",
		"Maintenance",
		"Vendors",
		"Tenants",
		"Collections",
		"Announcements",
		"Messages"
	]

	roles = [
		'Land Owner',
		'Facility Manager',
		'Board Member',
		'Janitor',
		'Leasing',
		'Concierge',
		'Housekeeping',
		'Gardener'
	]

	regionalManagerRole = "Regional Manager"
	locationManagerRole = "Location Manager"
	staffMemberRole = "Janitor"

	regionalManagers: SetUpUser[] = []
	locationManagers: SetUpUser[] = []
	staffMembers: SetUpUser[] = []

	errors: UsersAndRoles = {
		regionalManagers: [],
		locationManagers: [],
		staffMembers: []
	};

	dataLoaded;

	constructor(
		private redux: NgRedux<AppState>,
		private companyService: CompanyService,
		private stringValidation: StringValidationService
	) {
	}

	ngOnInit() {
		this.doNext.subscribe(value => {
			if (value == this.nextName) this.next();
		})

		this.getUsersData()

	}

	private getUsersData() {
		let dataFromServerFetched = false
		this.user$
			.pipe(
				filter(user => user.token !== null),
				takeWhile(_ => !dataFromServerFetched)
			)
			.subscribe(user => {
				dataFromServerFetched = true
				this.companyService.getCompanyUsers(user.companyKey)
					.then((data: any) => {
						if (data.users) {
							this.mapServerData(data.users);
							this.exposeUsers.emit({
								users: {
									regionalManagers: this.regionalManagers,
									locationManagers: this.locationManagers,
									staffMembers: this.staffMembers
								}
							})
						}
					})
			})
	}

	private mapServerData(users: SetUpUserServerGet[]) {
		users.forEach(user => {
			if (user.position.toLowerCase() === this.regionalManagerRole.toLowerCase()) {
				this.regionalManagers.push(this.mapServerUser(user))
			} else if (user.isLocationManager) {
				this.locationManagers.push(this.mapServerUser(user))
			} else {
				this.staffMembers.push(this.mapServerUser(user))
			}
		})
		if (!this.regionalManagers) {
			this.regionalManagers = [this.newUser(this.regionalManagerRole, true)]
		}
		if (this.locationManagers.length === 0) {
			this.locationManagers = [this.newUser(this.locationManagerRole, false)]
		}
		if (this.staffMembers.length === 0) {
			this.staffMembers = [this.newUser(this.staffMemberRole, false)]
		}
	}

	private mapServerUser(user: SetUpUserServerGet): SetUpUser {
		return {
			firstName: user.firstName,
			lastName: user.lastName,
			email: user.email,
			key: user.key,
			position: user.position,
			admin: user.admin,
			permissions: {
				actions: this.generatePermissions(user.actionPermissions),
				viewing: this.generatePermissions(user.viewPermissions)
			},
			isJanitor: user.isJanitor,
			isLocationManager: user.isLocationManager
		}
	}

	private newUser(position, admin): SetUpUser {
		let viewPermissions = Array.from(this.permissions)
		let actionPermissions = Array.from(this.permissions)
		return {
			admin,
			email: "",
			firstName: "",
			lastName: "",
			isJanitor: position === this.staffMemberRole,
			isLocationManager: position === this.locationManagerRole,
			permissions: {
				actions: this.generatePermissions(actionPermissions),
				viewing: this.generatePermissions(viewPermissions)
			},
			position: position === this.staffMemberRole ? "" : position
		}
	}

	private generatePermissions(permission = this.permissions): { [key: string]: boolean } {
		return this.convertArrayToObj(permission)
	}

	private convertArrayToObj(array): { [key: string]: boolean } {
		if (!array) return {};
		let obj: { [key: string]: boolean } = {};
		array.forEach(item => obj[item] = true)
		return obj;
	}

	toggleTable(permissionsTable: HTMLDivElement) {
		if (permissionsTable.style.display !== "block") {
			permissionsTable.style.display = "block"
		} else {
			permissionsTable.style.display = "none"
		}
	}

	appendLocationManager() {
		this.locationManagers.push(this.newUser(this.locationManagerRole, false))
	}

	appendStaffMember() {
		this.staffMembers.push(this.newUser(this.staffMemberRole, false))
	}

	appendRegionalManager() {
		this.regionalManagers.push(this.newUser(this.regionalManagerRole, false))
	}

	onDocumentClick(event) {
		Array.prototype.forEach.call(document.getElementsByClassName('roles-list'), (element: HTMLDivElement, index) => {
			let clickedOnDropdown = element.contains(event.target)
			let clickedOnSelector = element.parentElement.getElementsByTagName("input")[0].contains(event.target)
			if (!clickedOnDropdown && !clickedOnSelector && element.style.display !== "none") {
				element.style.display = "none"
			}
		})
	}

	private validate() {
		this.errors = {
			regionalManagers: [],
			locationManagers: [],
			staffMembers: []
		}

		this.errors.regionalManagers =
			this.regionalManagers
				.map(rm => this.validateUser(rm))

		this.errors.locationManagers =
			this.locationManagers
				.map(lm => this.validateUser(lm))

		this.errors.staffMembers =
			this.staffMembers
				.map(sm => this.validateUser(sm))

		return this.isErrorArrayContainsErrors(this.errors.regionalManagers) ||
			this.isErrorArrayContainsErrors(this.errors.locationManagers) ||
			this.isErrorArrayContainsErrors(this.errors.staffMembers)
	}

	private isErrorArrayContainsErrors(errors: any[]) {
		return errors.reduce((prev, e) => prev || e, false)
	}

	private validateUser(user: SetUpUser) {
		let errors: any = {}
		if (!user.email || user.email.length === 0 ||
			!this.stringValidation.isValidEmail(user.email)) {
			errors.email = "Invalid email"
		}
		if (!user.firstName || user.firstName.length === 0) {
			errors.firstName = "Invalid first name"
		}
		if (!user.lastName || user.lastName.length === 0) {
			errors.lastName = "Invalid last name"
		}
		if (!user.position || user.position.length === 0) {
			errors.position = "Invalid position"
		}

		if (Object.keys(errors).length > 0) {
			return errors
		}
	}

	next() {
		if (this.validate()) {
			this.doneNext.emit({ errors: true })
		}
		else {
			this.doneNext.emit({ loading: true })
			let usersToSend = [...this.regionalManagers, ...this.locationManagers, ...this.staffMembers].map(this.mapUserToServer.bind(this))
			this.companyService.addCompanyUsers(<any>usersToSend)
				.then(data => {
					let users = data.items
					if (users) {
						users.forEach(user => {
							let ragionalManagerIndex = this.regionalManagers.findIndex(rm => rm.email === user.email)
							let locationManagerIndex = this.locationManagers.findIndex(lm => lm.email === user.email)
							let staffMemberIndex = this.staffMembers.findIndex(sm => sm.email === user.email)
							if (ragionalManagerIndex > -1) {
								this.regionalManagers[ragionalManagerIndex].key = user.key
							} else if (locationManagerIndex > -1) {
								this.locationManagers[locationManagerIndex].key = user.key
							} else if (staffMemberIndex > -1) {
								this.staffMembers[staffMemberIndex].key = user.key
							}
						})
					}
					this.doneNext.emit({
						users: {
							regionalManagers: this.regionalManagers,
							locationManagers: this.locationManagers,
							staffMembers: this.staffMembers
						}
					});
				})
				.catch(err => {
					this.doneNext.emit({ errors: true, data: err })
				})
		}
	}

	private mapUserToServer(user: SetUpUser): SetUpUserServerCreate {
		return {
			key: user.key,
			forename: user.firstName,
			surname: user.lastName,
			admin: user.admin,
			actionPermissions: this.convertPermissionObjToArray(user.permissions.actions),
			viewPermissions: this.convertPermissionObjToArray(user.permissions.viewing),
			email: user.email,
			isJanitor: user.isJanitor || false,
			isLocationManager: user.isLocationManager || false,
			position: user.position
		}
	}

	private convertPermissionObjToArray(permissions: { [key: string]: boolean }): string[] {
		let permissionsArray = []
		for (let per in permissions) {
			if (permissions[per]) {
				permissionsArray.push(per)
			}
		}
		return permissionsArray
	}

}

export interface SetUpUser {
	key?: string
	firstName: string
	lastName: string
	position: string
	email: string
	admin: boolean
	isJanitor: boolean
	isLocationManager: boolean
	permissions: {
		viewing: {
			[key: string]: boolean
		},
		actions: {
			[key: string]: boolean
		}
	}
}

export interface UsersAndRoles {
	regionalManagers: SetUpUser[]
	locationManagers: SetUpUser[]
	staffMembers: SetUpUser[]
}

interface SetUpUserServerGet {
	key?: string
	firstName: string
	lastName: string
	position: string
	email: string
	admin: boolean
	isJanitor: boolean
	isLocationManager: boolean
	actionPermissions: string[]
	viewPermissions: string[]
}

interface SetUpUserServerCreate {
	key?: string
	forename: string
	surname: string
	position: string
	email: string
	admin: boolean
	isJanitor: boolean
	isLocationManager: boolean
	actionPermissions: string[]
	viewPermissions: string[]
}