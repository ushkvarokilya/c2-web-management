import { Pipe, PipeTransform } from '@angular/core';
import { Building } from '../components/setup/facilities-details/facilities-details.component';
import { UnitType } from "../components/facility/facility-units/facility-units.component";

@Pipe({
  name: 'filterUnitTypesByBuilding'
})
export class FilterUnitTypesByBuildingPipe implements PipeTransform {

  transform(units: UnitType[], building: Building): any {
    if(!building || !units || !Array.isArray(units)) {
      return units
    }
    return units.filter(unit => {
      return unit.buildings.findIndex(b => b.key === building.key) !== -1
    })
  }

}
