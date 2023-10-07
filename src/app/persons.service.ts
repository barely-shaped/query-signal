import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class PersonsService {
  constructor() {}

  public async getAll(quantity: number): Promise<Person[]> {
    const response = await fetch(
      `https://fakerapi.it/api/v1/persons?_quantity=${quantity}`,
    );
    if (!response.ok) {
      throw new Error(`HTTP error, status = ${response.status}`);
    }
    const res = await response.json();

    return res.data;
  }
}

interface Person {
  id: number;
  firstname: string;
  lastname: string;
  email: string;
  phone: string;
  birthday: string;
  gender: string;
  address: Address;
  website: string;
  image: string;
}

interface Address {
  id: number;
  street: string;
  streetName: string;
  buildingNumber: string;
  city: string;
  zipcode: string;
  country: string;
  county_code: string;
  latitude: number;
  longitude: number;
}
