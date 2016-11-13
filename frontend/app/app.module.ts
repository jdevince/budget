import { NgModule }      from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule }   from '@angular/forms';
import { HttpModule } from '@angular/http';

import { AppComponent }   from './app.component';
import { BudgetComponent } from './budget/budget.component';
import { HomepageComponent } from './homepage/homepage.component';
import { LoginComponent } from './user/login.component';
import { MenuBarComponent } from './menu-bar/menu-bar.component';
import { SignUpComponent } from './user/signup.component';

import { InputSectionComponent } from './budget/input-section.component';

import { CustomCurrencyFormatterDirective } from './budget/currency-formatter.directive';
import { CustomCurrencyPipe } from './budget/custom-currency.pipe';

import { AppRoutingModule } from './app-routing.module';

@NgModule({
  imports:      [ 
    BrowserModule,
    FormsModule,
    HttpModule,
    AppRoutingModule
  ],
  declarations: [ 
    AppComponent,
    BudgetComponent,
    HomepageComponent,
    LoginComponent,
    MenuBarComponent,
    SignUpComponent,
    InputSectionComponent,
    CustomCurrencyFormatterDirective,
    CustomCurrencyPipe
  ],
  bootstrap:    [ AppComponent ]
})
export class AppModule { }
