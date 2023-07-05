import { AfterViewInit, Component, OnInit } from "@angular/core";
import { Auth, EmailAuthProvider } from "@angular/fire/auth";
import * as firebaseui from "firebaseui";

@Component({
  selector: "app-auth",
  templateUrl: "./auth.component.html",
  styleUrls: ["./auth.component.scss"],
})
export class AuthComponent implements OnInit, AfterViewInit {
  constructor(private auth: Auth) {}

  ngOnInit() {}

  ngAfterViewInit() {
    const ui = new firebaseui.auth.AuthUI(this.auth);
    ui.start("#firebaseui-auth-container", {
      signInOptions: [
        {
          provider: EmailAuthProvider.PROVIDER_ID,
          signInMethod: EmailAuthProvider.EMAIL_LINK_SIGN_IN_METHOD,
          requireDisplayName: false,
        },
      ],
    });
  }
}
