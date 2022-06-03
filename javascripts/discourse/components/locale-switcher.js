import Component from "@ember/component";
import cookie from "discourse/lib/cookie";
import { ajax } from "discourse/lib/ajax";
import { action } from "@ember/object";
import discourseComputed from "discourse-common/utils/decorators";

const COOKIENAME = settings.locale_cookie_name;

export default Component.extend({
  tagName: "",
  _userLocale: "",

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
  },

  _getLocale() {
    if (this.isDestroying || this.isDestroyed) {
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
  },

  _setLocale(newLocale, setCookie) {
    let userPath = `/u/${this.currentUser.username.toLowerCase()}.json`;
    ajax(userPath, {
      type: "PUT",
      data: { locale: newLocale },
    }).then(() => {
      if (setCookie) {
        cookie(COOKIENAME, newLocale);
      }
      window.location.reload();
    });
  },

  didInsertElement() {
    this._super(...arguments);
    this._getLocale();
  },

  @action
  setLocale(locale) {
    if (locale) {
      this._setLocale(locale, true);
    }
  },
});
