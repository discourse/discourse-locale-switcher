import Component from "@ember/component";
import { action } from "@ember/object";
import { tagName } from "@ember-decorators/component";
import { ajax } from "discourse/lib/ajax";
import cookie from "discourse/lib/cookie";
import discourseComputed from "discourse/lib/decorators";

const COOKIENAME = settings.locale_cookie_name;

@tagName("")
export default class LocaleSwitcher extends Component {
  _userLocale = "";

  @discourseComputed()
  locales() {
    let localeSetting = settings.available_locales.split("|");
    let localeConstructed = [];

    localeSetting.forEach((locale) => {
      let split = locale.split(": ");
      let splitLocale = {
        name: split[1],
        value: split[0],
      };
      localeConstructed.push(splitLocale);
    });

    return localeConstructed;
  }

  _getLocale() {
    if (this.isDestroying || this.isDestroyed || !this.currentUser) {
      return;
    }

    this.currentUser.findDetails().then((user) => {
      this.set("_userLocale", user.locale);

      if (!cookie(COOKIENAME)) {
        return;
      } else if (cookie(COOKIENAME) === user.locale) {
        return;
      } else {
        this._setLocale(cookie(COOKIENAME), false);
      }
    });
  }

  _setLocale(newLocale, setCookie) {
    if (this.currentUser) {
      let userPath = `/u/${this.currentUser.username.toLowerCase()}.json`;
      ajax(userPath, {
        type: "PUT",
        data: { locale: newLocale },
      }).then(() => {
        this._setLocaleCookie(newLocale, setCookie);
      });
    } else {
      this._setLocaleCookie(newLocale, setCookie);
    }
  }

  _setLocaleCookie(newLocale, setCookie) {
    if (setCookie) {
      cookie(COOKIENAME, newLocale);
    }
    window.location.reload();
  }

  didInsertElement() {
    super.didInsertElement(...arguments);
    this._getLocale();
  }

  @action
  setLocale(locale) {
    if (locale) {
      this._setLocale(locale, true);
    }
  }
}
