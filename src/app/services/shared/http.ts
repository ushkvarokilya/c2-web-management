import { Injectable } from '@angular/core';
import { NgRedux, select } from '@angular-redux/store';
import { Http, Headers, Response } from '@angular/http';
import { Observable } from 'rxjs/Observable';

import { User } from '../../store/user/user.interface';
import { AppState } from '../../store/appState';

import { environment } from "../../../environments/environment";

@Injectable()
export class AppHttpService {

	@select(['user']) user$: Observable<User>;
	private headers: Headers;

	endpoint = environment.api_endpoint;

	constructor(private http: Http, private redux: NgRedux<AppState>) {
		this.headers = new Headers({
			'Content-Type': 'application/json'
		});
		this.user$.subscribe(user => {
			if (user.token) {
				this.headers.set('Authorization', 'Bearer ' + user.token)
			} else {
				this.headers.delete('Authorization');
			}
		})
	}

	private handleError(error: any) {
		let errMsg: string;
		if (error instanceof Response) {
			try {
				const body = error.json() || '';
				const err = body.error || JSON.stringify(body);
				errMsg = body.error.message;
			} catch (e) {
				errMsg = error.toString();
			}
		} else {
			errMsg = error.message ? error.message : error.toString();
		}
		return errMsg;
	}

	private handlePromiseError(error: any): Promise<any> {
		let errMsg = this.handleError(error)
		throw new Error(errMsg);
	}

	private handleObservalbeError(error) {
		let errMsg = this.handleError(error)
		return Observable.throw(errMsg);
	}

	get(path: string, additionalHeaders?: any) {
		return new Promise((resolve, reject) => {
			let xmlHttp = new XMLHttpRequest();
			xmlHttp.onreadystatechange = () => {
				if (xmlHttp.readyState == XMLHttpRequest.DONE) {
					if (xmlHttp.status >= 200 && xmlHttp.status <= 204) {
						let jsonText = xmlHttp.responseText;
						if (jsonText && typeof jsonText == 'string' && jsonText.length > 0) resolve(JSON.parse(jsonText))
						else resolve(jsonText);
					} else {
						reject({ status: xmlHttp.status, message: xmlHttp.responseText })
					}
				}
			}
			let headers = new Headers(this.headers)
			if (additionalHeaders && typeof additionalHeaders == "object") {
				for (let key in additionalHeaders) {
					headers.set(key, additionalHeaders[key])
				}
			}
			let headersJSON = headers.toJSON()
			xmlHttp.open("GET", this.endpoint + path, true);
			for (let key in headersJSON) {
				xmlHttp.setRequestHeader(key, headersJSON[key])
			}
			xmlHttp.send();
		})
	}

	private mapResponse(res) {
		try {
			return Promise.resolve(res.json())
		} catch (e) {
			console.warn('error while converting json', e);
			return Promise.resolve()
		}
	}

	private post(path, body, headers = this.headers) {
		return this.http.post(this.endpoint + path, body, { headers })
	}

	postObservable(path, body) {
		return this.post(path, body)
			.map(res => res.json())
			.catch(this.handleObservalbeError.bind(this))
	}

	postPromisified(path, body, headers?: Headers) {
		return this.post(path, body, headers)
			.toPromise()
			.then(this.mapResponse)
			.catch(this.handlePromiseError.bind(this))
	}

	private put(path, body) {
		return this.http.put(this.endpoint + path, body, { headers: this.headers })
	}

	putObservable(path, body) {
		return this.put(path, body)
			.map(res => res.json())
			.catch(this.handleObservalbeError.bind(this))
	}

	putPromisified(path, body) {
		return this.put(path, body)
			.toPromise()
			.then(this.mapResponse)
			.catch(this.handlePromiseError.bind(this))
	}

	private delete(path) {
		return this.http.delete(this.endpoint + path, { headers: this.headers })
	}

	deletePromisified(path) {
		return this.delete(path)
			.toPromise()
			.then(this.mapResponse)
			.catch(this.handlePromiseError.bind(this))
	}

	commonCatchAndReject(err, serviceName, functionName) {
		console.error(serviceName, ': error while', functionName, err);
		return Promise.reject(err)
	}

}