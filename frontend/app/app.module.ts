import { NgModule }      from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule }   from '@angular/forms';
import { HttpModule } from '@angular/http';

import { AppComponent }   from './app.component';
import { MenuBarComponent } from './menu-bar/menu-bar.component';
import { CreateAccFormComponent } from './user/create-acc-form.component';
import { LoginFormComponent } from './user/login-form.component';

@NgModule({
  imports:      [ 
    BrowserModule,
    FormsModule,
    HttpModule
  ],
  declarations: [ 
    AppComponent,
    MenuBarComponent,
    CreateAccFormComponent,
    LoginFormComponent
  ],
  bootstrap:    [ AppComponent ]
})
export class AppModule { }
