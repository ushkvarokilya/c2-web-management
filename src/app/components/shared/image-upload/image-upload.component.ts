import { Component, OnInit, EventEmitter, Output, Input, ElementRef, ViewChild } from '@angular/core';

import { environment } from "../../../../environments/environment";
import { FormBuilder } from '@angular/forms';


@Component({
  selector: 'app-image-upload',
  template: `<input type="file" style="display: none" #fileUpload (change)="handleFiles($event)">`
})
export class ImageUploadComponent implements OnInit {

  @Output() imageUploaded = new EventEmitter()
  @Output() imageUploadedAndName = new EventEmitter()

  uploadingInProgress: boolean = false
  // @Output() uploadingInProgressChange = new EventEmitter<boolean>()

  uploadProgress: number = 0
  @Output() uploadProgressChange = new EventEmitter<number>()

  @ViewChild("fileUpload") fileUploadElementRef: ElementRef
  fileUploadElement: HTMLInputElement;

  ticket
  folder;
  isFileName;
  constructor() { }

  ngOnInit() {
    this.fileUploadElement = this.fileUploadElementRef.nativeElement
  }

  click() {
    if (!this.uploadingInProgress) {
      this.fileUploadElement.click()
    }
  }

  clickFolder(folder, isFileName, ticket) {
    this.ticket = ticket;
    this.folder = folder;
    this.isFileName = isFileName;
    if (!this.uploadingInProgress) {
      this.fileUploadElement.click()
    }
  }

  handleFiles($event) {
    let file = this.fileUploadElement.files[0]
    this.uploadFile(file)
  }

  private uploadFile(file) {
    this.uploadingInProgress = true

    let url = `https://api.cloudinary.com/v1_1/${environment.cloudinary_cloud_name}/upload`;
    let xhr = new XMLHttpRequest();
    let fd = new FormData();

    xhr.open('POST', url, true);
    xhr.setRequestHeader('X-Requested-With', 'XMLHttpRequest');

    // Update progress (can be used to show progress indicator)
    xhr.upload.addEventListener("progress", (e) => {
      let progress = Math.round((e.loaded * 100.0) / e.total);
      this.setUploadProgress(progress)
    });

    xhr.onreadystatechange = (e) => {
      if (xhr.readyState == 4 && xhr.status == 200) {
        let response = JSON.parse(xhr.responseText);
        let url = response.secure_url;
        this.imageUploaded.emit(url);
        this.imageUploadedAndName.emit({ name: file.name, url: response.secure_url });
        this.uploadingInProgress = false
        this.setUploadProgress(0)

      }
    };

    fd.append('upload_preset', environment.cloudinary_cert);
    fd.append('file', file);
    if (this.folder) {
      fd.append('folder', this.folder);
    }
    if (this.isFileName) {
      fd.append('public_id', file.name.split(".")[0]);
    }
    fd.append('tags', 'Management_' + this.ticket.ticketId);

    xhr.send(fd);
  }

  private setUploadProgress(progress) {
    this.uploadProgress = progress
    this.uploadProgressChange.emit(this.uploadProgress)
  }

  // toggleUploadingInProgress() {
  //   this.uploadingInProgress != this.uploadingInProgress
  //   // this.uploadingInProgressChange.emit(this.uploadingInProgress)
  //   if (!this.uploadingInProgress) {
  //     this.setUploadProgress(0)
  //   }
  // }

}
