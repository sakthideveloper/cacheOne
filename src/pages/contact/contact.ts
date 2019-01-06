import { Component, OnInit, OnChanges } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { Subject } from 'rxjs/Subject';
import { merge } from 'rxjs/observable/merge';
import { take, switchMap, mergeMap, skip, mapTo } from 'rxjs/operators';
import { JokeServiceProvider, Joke } from '../../providers/joke-service/joke-service';
import { Memoize } from 'lodash-decorators';
import { ToastController, Toast } from 'ionic-angular';

@Component({
  selector: 'page-contact',
  templateUrl: 'contact.html'
})
export class ContactPage implements OnInit, OnChanges{

  jokes$: Observable<Array<Joke>>;
  showNotification$: Observable<boolean>;
  update$ = new Subject<void>();
  forceReload$ = new Subject<void>();
  connectedToast: Toast; disconnectedToast: Toast;

  constructor(private jokeService: JokeServiceProvider, public toastCtrl: ToastController) { }

  ngOnInit() {
    const initialJokes$ = this.getDataOnce();

    const updates$ = merge(this.update$, this.forceReload$).pipe(
      mergeMap(() => this.getDataOnce())
    );

    this.jokes$ = merge(initialJokes$, updates$);

    const reload$ = this.forceReload$.pipe(switchMap(() => this.getNotifications()));
    const initialNotifications$ = this.getNotifications();
    const show$ = merge(initialNotifications$, reload$).pipe(mapTo(true));
    const hide$ = this.update$.pipe(mapTo(false));
    this.showNotification$ = merge(show$, hide$);


  }

  ngOnChanges(){
console.log("this.showNotification$",this.showNotification$);

  }

  getDataOnce() {
    return this.jokeService.jokes.pipe(take(1));
  }

  getNotifications() {
    return this.jokeService.jokes.pipe(skip(1));
  }

  forceReload() {
    this.jokeService.forceReload();
    this.forceReload$.next();
  }

  @Memoize()
  getVotes(id: number) {
    return Math.floor(10 + Math.random() * (100 - 10));
  }

  presentToast() {
    this.connectedToast = this.toastCtrl.create({
      message: 'There\'s new data available. Click to reload the data.',
      position: 'top',
      showCloseButton:true,
      closeButtonText:"Close"
    });
    this.connectedToast.present();
  }

  dismissToast(){
   if(this.connectedToast){
    this.connectedToast.dismissAll();
   }
  }

}
