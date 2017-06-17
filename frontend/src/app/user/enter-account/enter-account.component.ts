import { Component, Input, Host } from '@angular/core';
import { BudgetService } from './../../budget/budget.service';
import { User } from './../user';
import { UserService } from './../user.service';
import { EnterAccountType } from './enter-account.enums';
import { MenuBarComponent } from './../../menu-bar/menu-bar.component';
import { ViewChild } from '@angular/core';
import { ReCaptchaComponent } from 'angular2-recaptcha';

@Component({
    moduleId: module.id,
    selector: 'enter-account',
    templateUrl: '/app/user/enter-account/enter-account.component.html',
    styleUrls: ['../../../app/user/enter-account/enter-account.component.css'] //styleUrls doesn't accept root path: https://github.com/angular/angular/issues/4974
})

export class EnterAccountComponent {
    @Input() public set EnterAccountTypeInput(value: string) {
        this.EnterAccountType = EnterAccountType[value];
    }
    @ViewChild(ReCaptchaComponent) captcha: ReCaptchaComponent;

    public EnterAccountType: EnterAccountType;
    public User = new User(null, null, null);
    public ErrorLoggingIn: boolean = false;
    public ErrorCreatingAccount: boolean = false;

    constructor(
        private budgetService: BudgetService,
        private userService: UserService,
        @Host() private parentMenuBarComponent: MenuBarComponent
    ) { }

    get Caption(): string {
        let caption: string = "";

        switch (this.EnterAccountType) {
            case EnterAccountType.Signup:
                caption = "Sign Up";
                break;
            case EnterAccountType.Login:
                caption = "Log In";
                break;
        }
        return caption;
    }

    close() {
        //Close popup
        this.parentMenuBarComponent.ShowSignupForm = false;
        this.parentMenuBarComponent.ShowLoginForm = false;
    }

    onSubmit() {
        this.userService.validateCaptcha(this.captcha.getResponse())
            .subscribe((success) => {
                if (success) {
                    //Captcha is valid. Continue with login/signup
                    if (this.EnterAccountType === EnterAccountType.Signup) {
                        this.createAcc(this.User.username, this.User.password);
                    }
                    else if (this.EnterAccountType === EnterAccountType.Login) {
                        this.login(this.User.username, this.User.password, true);
                    }
                }
            });
    }

    private login(username: string, password: string, reload: boolean) {
        if ((!username) || (!password)) {
            return;
        }

        this.userService.login(username, password)
            .subscribe((result) => {
                if (result) {
                    if (reload) {
                        this.ErrorLoggingIn = false;
                        //Reload data on Login, but not after Create Account to preserve potential changes already made
                        this.budgetService.reload();
                    }
                    this.close();
                }
                else {
                    this.ErrorLoggingIn = true;
                    this.captcha.reset();
                }
            });
    }

    private createAcc(username: string, password: string) {
        if ((!username) || (!password)) {
            return;
        }

        this.userService.createAcc(username, password)
            .subscribe(
            created => {
                if (created) {
                    this.ErrorCreatingAccount = false;
                    this.login(username, password, false);
                }
                else {
                    this.ErrorCreatingAccount = true;
                    this.captcha.reset();
                }
            },
            error => console.log(<any>error)
            );
    }
}