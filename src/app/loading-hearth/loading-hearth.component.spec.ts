import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LoadingHearthComponent } from './loading-hearth.component';

describe('LoadingHearthComponent', () => {
  let component: LoadingHearthComponent;
  let fixture: ComponentFixture<LoadingHearthComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [LoadingHearthComponent]
    });
    fixture = TestBed.createComponent(LoadingHearthComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
