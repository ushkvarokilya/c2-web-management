import { Pipe, PipeTransform } from '@angular/core';
import { Tenant } from "../store/company/company.interface";

@Pipe({
  name: 'tenantsToBuildings'
})

export class TenantsToBuildingsPipe implements PipeTransform {
  transform(tenants: Tenant[]): any {
    if(!tenants) return tenants
    return tenants.reduce((buildings, tenant) => {
      let buildingIndex = buildings.findIndex(b => b.key === tenant.building.key)
      if (buildingIndex > -1) {
        buildings[buildingIndex].tenants.push(tenant)
      } else {
        buildings.push(Object.assign({}, tenant.building, { tenants: [tenant] }))
      }
      return buildings
    }, [])
  }
}