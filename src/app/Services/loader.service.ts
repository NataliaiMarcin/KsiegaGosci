import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class LoaderService {

  private loading: boolean = false;
  private doNotActivate: boolean = false;

  constructor() { }

  setLoading(loading: boolean) {
    this.loading = loading && !this.doNotActivate;
  }

  setDoNotActivate(DoNotActivate: boolean){
    this.doNotActivate = DoNotActivate;
  }

  getLoading(): boolean {
    return this.loading;
  }
}