import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'filterUsedProfessions'
})
export class FilterUsedProfessionsPipe implements PipeTransform {

  transform(professions: string[], usedProfessions: string[]): string[] {
    if(professions && Array.isArray(professions)) {
      return professions.filter(profession => !usedProfessions.includes(profession))
    } else {
      return professions
    }
  }

}
