import { Injectable } from '@angular/core';

@Injectable()
export class StringValidationService {

  isValidUrlRegex = /(http(s)?:\/\/.)?(www\.)?[-a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_\+.~#?&=]*)/
  isValidEmailRegex = /^[a-zA-Z0-9.!#$%&’*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/
  isMP4Regex = /\.mp4(\?\=?.*)?$/ig
  isImageMimeTypeRegex = /^image\/(jpg|png|p?jpeg|gif)$/

  constructor() { }

  isValidUrl(string: string) {
    return this.isValidUrlRegex.test(string)
  }

  isValidEmail(string: string) {
    return this.isValidEmailRegex.test(string)
  }

  isValidMP4File(string: string) {
    return this.isMP4Regex.test(string)
  }

  isImageMimeType(string: string) {
    return this.isImageMimeTypeRegex.test(string)
  }

}
