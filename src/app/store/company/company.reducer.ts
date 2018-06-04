import { Company, companyInit, complexKeyLocalStorageString } from './company.interface';
import { CompanyActionsNames } from './company.ac';
import { Reducer, Action } from 'redux';
import * as CompanyActions from './company.ac';

let setNameAndImage = (state: Company, action: CompanyActions.SetNameAndImageAction) =>
	Object.assign({}, state, { name: action.name, imageUrl: action.imageUrl })

let setingComplexes = (state: Company, action: CompanyActions.SetComplexesAction) => {
	let currentComplexKey = localStorage.getItem(complexKeyLocalStorageString)
	let currentComplex = state.currentComplex
	if (currentComplexKey) {
		currentComplex = action.complexes.find(complex => complex.key === currentComplexKey)
	}
	if (!currentComplex) {
		currentComplex = action.complexes[0]
	}
	localStorage.setItem(complexKeyLocalStorageString, currentComplex.key)
	return Object.assign({}, state, { complexes: action.complexes, currentComplex });
}

let setCurrentComplex = (state: Company, action: CompanyActions.SetCurrentComplexAction) => {
	return Object.assign({}, state, { currentComplex: action.complex })
}

let loadingTenantsToComplex = (state: Company, action: CompanyActions.LoadTenantsToComplex) => {
	let complexKey = action.complexKey;
	let tenants = action.tenants;
	let complexIndex = state.complexes.findIndex(c => c.key == complexKey);
	state.complexes[complexIndex].tenants = tenants ? tenants : [];
	return Object.assign({}, state);
}

let updateCurrentComplexPhoto = (state: Company, action: CompanyActions.UpdateCurrentComplexPhotoAction) => {
	state.currentComplex.imageUrl = action.imageUrl;
	return Object.assign({}, state)
}

export const companyReducer: Reducer<Company> = (state: Company = companyInit, action: Action) => {
	switch (action.type) {
		case CompanyActionsNames.SetNameAndImage: return setNameAndImage(state, <CompanyActions.SetNameAndImageAction>action)
		case CompanyActionsNames.SetComplex: return setingComplexes(state, <CompanyActions.SetComplexesAction>action)
		case CompanyActionsNames.LoadTenantsToComplex: return loadingTenantsToComplex(state, <CompanyActions.LoadTenantsToComplex>action)
		case CompanyActionsNames.UpdateCurrentComplexPhoto: return updateCurrentComplexPhoto(state, <CompanyActions.UpdateCurrentComplexPhotoAction>action);
		case CompanyActionsNames.SetCurrentComplex: return setCurrentComplex(state, <any>action);
		default: return state;
	}
}