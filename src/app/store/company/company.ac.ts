import { Action, ActionCreator } from 'redux';
import { Complex, Tenant } from './company.interface';

export const CompanyActionsNames = {
	SetNameAndImage: "[company] set name and image",
	SetComplex: "[company] set complexes",
	SetCurrentComplex: "[company] set current complex",
	LoadTenantsToComplex: "[company] load tenants to complex",
	UpdateCurrentComplexPhoto: "[company] update current complex photo"
}

export interface SetNameAndImageAction extends Action{
	name: string,
	imageUrl: string
}

export interface SetComplexesAction extends Action{
	complexes: Complex[]
}

export interface LoadTenantsToComplex extends Action{
	complexKey: string;
	tenants: Tenant[];
}

export interface UpdateCurrentComplexPhotoAction extends Action{
	imageUrl: string
}

export interface SetCurrentComplexAction extends Action{
	complex: Complex
}

export const setNameAndImage: ActionCreator<SetNameAndImageAction> = (name, imageUrl) => ({
	type: CompanyActionsNames.SetNameAndImage,
	name,
	imageUrl
})

export const setComplexes: ActionCreator<SetComplexesAction> = (complexes) => ({
	type: CompanyActionsNames.SetComplex,
	complexes
})

export const loadTenantsToComplex: ActionCreator<LoadTenantsToComplex> = (complexKey, tenants) => ({
	type: CompanyActionsNames.LoadTenantsToComplex,
	complexKey,
	tenants
})

export const updateCurrentComplexPhoto: ActionCreator<UpdateCurrentComplexPhotoAction> = (imageUrl) => ({
	type: CompanyActionsNames.UpdateCurrentComplexPhoto,
	imageUrl
})

export const setCurrentComplex: ActionCreator<SetCurrentComplexAction> = (complex) => ({
	type: CompanyActionsNames.UpdateCurrentComplexPhoto,
	complex
})