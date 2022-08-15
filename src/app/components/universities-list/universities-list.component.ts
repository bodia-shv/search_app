import {AfterViewInit, Component, HostListener, OnInit, ViewChild} from '@angular/core';

import {UniversityService} from "../../services/university.service";
import {Subscription} from "rxjs";
import {Observable} from "rxjs";
import { FormControl} from "@angular/forms";
import {map, startWith} from "rxjs/operators";
import {MatTable, MatTableDataSource} from "@angular/material/table";
import {MatSort} from "@angular/material/sort";
import {MatPaginator} from "@angular/material/paginator";
import {CdkDragDrop, moveItemInArray, transferArrayItem} from "@angular/cdk/drag-drop";
import {MatSlideToggleChange} from "@angular/material/slide-toggle";
import {animate, state, style, transition, trigger} from "@angular/animations";
import {SelectionModel} from "@angular/cdk/collections";

@Component({
  selector: 'app-universities-list',
  templateUrl: './universities-list.component.html',
  styleUrls: ['./universities-list.component.sass'],
  animations: [
    trigger('detailExpand', [
      state('collapsed', style({height: '0px', minHeight: '0'})),
      state('expanded', style({height: '*'})),
      transition('expanded <=> collapsed', animate('225ms cubic-bezier(0.4, 0.0, 0.2, 1)')),
    ]),
  ],
})
export class UniversitiesListComponent implements OnInit {

  displayedColumns: any[] = ['select', 'country', 'alpha_two_code', 'name', 'state-province', 'domains', 'web_pages'];
  columnsToDisplayWithExpand = [...this.displayedColumns, 'expand'];
  columns: any[] = [
    {title: 'Country', field: 'country'},
    {title: 'Code', field: 'alpha_two_code'},
    {title: 'Name', field: 'name'},
    {title: 'State province', field: 'state-province'},
    {title: 'Domains', field: 'domains'},
    {title: 'Web pages', field: 'web_pages'}
    ];
  dataSource: MatTableDataSource<UniversityData>;
  selection = new SelectionModel<UniversityData>(true, []);

  @ViewChild('table') table: MatTable<UniversityData>;
  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;

  mobile: boolean = false;
  loading: boolean = false;
  stickyColumns: boolean = false;

  search = new FormControl('');
  options: string[] = [];
  filteredOptions: Observable<string[]>;

  universities: UniversityData[] = [];
  expandedElement: UniversityData | null;

  constructor(
    public UniversityService: UniversityService
  ) { }

  ngOnInit(): void {
    this.isMobile(window.innerWidth);
    this.getListOfCountries();
    this.filteredOptions = this.search.valueChanges.pipe(
      map(value => this._filter(value || '')),
    );
  }

  /** Check display width on window resizing and set mobile property true|false. */
  @HostListener('window:resize', ['$event'])
  onWindowResize() {
    this.isMobile(window.innerWidth);
  }
  isMobile(w: string | number): void {
    if (+w <= 960) {
      this.mobile = true;
    } else {
      this.mobile = false;
    }
  }

  /** Filter for suggestions list */
  private _filter(value: string): string[] {
    const filterValue = value.toLowerCase();

    return this.options.filter(option => {
      return option.toLowerCase().includes(filterValue);
    });
  }

  /** Suggestions list(GET)*/
  getListOfCountries(): void {
    this.UniversityService.getCountries().subscribe(res => {
      console.log('List loaded');
      this.options = res;
    })
  }

  /** Submit search and on response set paginator and sort*/
  submitSearchForm(search: string): void {
    this.loading = true;
    this.UniversityService.load(search).subscribe(res => {
      this.dataSource = new MatTableDataSource(res);
      console.log(this.paginator);
      this.dataSource.paginator = this.paginator;
      this.dataSource.paginator.pageIndex = 0;
      this.dataSource.sort = this.sort;
      this.loading = false;
    })
  }

  /** Move columns on drag and drop */
  onColumnDrop(event: CdkDragDrop<any[]>) {
    moveItemInArray(this.columnsToDisplayWithExpand, event.previousIndex, event.currentIndex);
  }

  /** Filter table data*/
  doFilter(e: any): void {
    this.dataSource.filter = e.target.value.trim().toLocaleLowerCase();
    console.log(this.dataSource);
  }

  /** Whether the number of selected elements matches the total number of rows. */
  isAllSelected() {
    const numSelected = this.selection.selected.length;
    const numRows = this.dataSource.filteredData.length;
    return numSelected === numRows;
  }

  /** Selects all rows if they are not all selected; otherwise clear selection. */
  masterToggle() {
    this.isAllSelected() ?
      this.selection.clear() :
      this.dataSource.filteredData.forEach(row => this.selection.select(row));
  }

}

export interface UniversityData {
  country: string;
  alpha_two_code: string;
  name: string;
  domains: string;
  web_pages: string;
  'state-province': string;
} {

}
