import { NgModule }      from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule }   from '@angular/forms';
import { HttpModule } from '@angular/http';

import { AppComponent }   from './app.component';
import { BudgetComponent } from './budget/budget/budget.component';
import { LoginComponent } from './user/login.component';
import { MenuBarComponent } from './menu-bar/menu-bar.component';
import { SignUpComponent } from './user/signup.component';

import { InputSectionComponent } from './budget/input-section/input-section.component';
import { TaxesComponent } from './budget/taxes/taxes.component';
import { BreakdownComponent } from './budget/breakdown/breakdown.component';
import { SummaryComponent } from './budget/summary/summary.component';

import { MyMatchHeightDirective } from './my-match-height/my-match-height.directive';

import { Tab } from './tabs/tab.component';
import { Tabs } from './tabs/tabs.component';

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
    LoginComponent,
    MenuBarComponent,
    SignUpComponent,
    InputSectionComponent,
    TaxesComponent,
    BreakdownComponent,
    SummaryComponent,
    MyMatchHeightDirective,
    Tab,
    Tabs,
    CustomCurrencyFormatterDirective,
    CustomCurrencyPipe
  ],
  bootstrap:    [ AppComponent ]
})
export class AppModule { }
