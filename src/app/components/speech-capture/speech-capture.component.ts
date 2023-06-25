import {Component, EventEmitter, NgZone, OnDestroy, OnInit, Output} from '@angular/core';

declare var webkitSpeechRecognition: any;

const SpeechRecognition =
    (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

@Component({
    selector: 'app-speech-capture',
    templateUrl: './speech-capture.component.html',
    styleUrls: ['./speech-capture.component.scss']
})
export class SpeechCaptureComponent implements OnInit, OnDestroy {

    @Output()
    captureEvent = new EventEmitter<string>();

    inProgress = false;

    results!: any;
    private vSearch: any;

constructor(private ngZone: NgZone) {
}
    actionCaptureSpeech() {
        this.inProgress = true;
        this.vSearch.start();
    }

    ngOnDestroy(): void {
        if (this.vSearch) {
            this.vSearch.abort();
        }
    }

    ngOnInit(): void {
        this.vSearch = new SpeechRecognition() as any;
        this.vSearch.continuous = false;
        this.vSearch.interimresults = false;
        this.vSearch.lang = 'sl-SI';

        this.vSearch.onresult = (e: any) => {
            const results = e.results[0][0].transcript;
            this.ngZone.run(() => {
                this.captureEvent.emit(results)
            });
        }

        this.vSearch.onspeechend = () => {
            this.inProgress = false;
            this.vSearch.stop();
        }

        this.vSearch.onnomatch = (e: any) => {
            console.log('No match found.');
        }

        this.vSearch.onerror = (e: any) => {
            console.error(e);
        }
    }
}
