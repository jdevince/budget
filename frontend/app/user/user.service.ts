import { Injectable }     from '@angular/core';
import { Headers, Http, Response, RequestOptions } from '@angular/http';

import { Observable }     from 'rxjs/Observable';
import { Subject }        from 'rxjs/Subject';

import { User }           from './user';

@Injectable()
export class UserService {
  private loggedIn = false;
  private createAccUrl = 'http://localhost:5000/api/user/create';  // URL to web API
  private loginUrl = 'http://localhost:5000/api/user/login';
  
  loggedInChange: Subject<boolean> = new Subject<boolean>();

  constructor (private http: Http) { 
    this.updateLoggedIn();  
  }

  createAcc (username: string, password: string): Observable<User> {
    let body = JSON.stringify({ "username" : username, "password": password });
    let headers = new Headers({ 'Content-Type': 'application/json' });
    let options = new RequestOptions({ headers: headers });

    return this.http
                  .post(this.createAccUrl, body, options)
                  .map(this.extractData)
                  .catch(this.handleError);
  }

  login(username: string, password: string): Observable<boolean> {
    let headers = new Headers({ 'Content-Type': 'application/json' });
    let body = JSON.stringify({ "username" : username, "password": password });
    let options = new RequestOptions({ headers: headers });

    var httpCall = this.http
                  .post(this.loginUrl, body, options)
                  .map(this.setAccessToken)
                  .catch(this.handleError);

    httpCall.subscribe(
      result => this.updateLoggedIn()
    );              
      
    return httpCall;       
  }

  private extractData(res: Response) {
    let body = res.json();
    return body.data || { };
  }

  private handleError (error: any) {
    // In a real world app, we might use a remote logging infrastructure
    // We'd also dig deeper into the error to get a better message
    let errMsg = (error.message) ? error.message :
      error.status ? `${error.status} - ${error.statusText}` : 'Server error';
    console.error(errMsg); // log to console instead
    return Observable.throw(errMsg);
  }

  private setAccessToken(res: any) {
    if (res.ok) {
      let body = res.json();
      
      if (body.accessToken) {
        //Log In Successful
        localStorage.setItem('accessToken', body.accessToken);     

        return true;
      }
    }
    return false;
  }

  logout() {
    localStorage.removeItem('accessToken');
    this.updateLoggedIn();
  }

  isLoggedIn() {
    return this.loggedIn;
  }

  private updateLoggedIn() {
      this.loggedIn = !!localStorage.getItem('accessToken');
      this.loggedInChange.next(this.loggedIn);
  }

}
