import {MatButtonModule, MatCheckboxModule} from '@angular/material';
import { NgModule } from '@angular/core';
import {MatToolbarModule} from '@angular/material/toolbar';
import {MatTabsModule} from '@angular/material/tabs';
import {MatIconModule} from '@angular/material/icon';
import {MatInputModule} from '@angular/material/input';
import {MatDividerModule} from '@angular/material/divider';
import {MatProgressBarModule} from '@angular/material/progress-bar';

@NgModule({
  imports: [MatButtonModule, MatCheckboxModule, MatToolbarModule,MatTabsModule,MatIconModule,MatInputModule,MatDividerModule,MatProgressBarModule],
  exports: [MatButtonModule, MatCheckboxModule, MatToolbarModule,MatTabsModule,MatIconModule,MatInputModule,MatDividerModule,MatProgressBarModule],
})
export class MaterialModule { }