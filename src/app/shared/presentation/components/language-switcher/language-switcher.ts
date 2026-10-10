import {Component} from '@angular/core';
import {TranslateService} from '@ngx-translate/core';

@Component({
  selector: 'app-language-switcher',
  imports: [],
  templateUrl: './language-switcher.html',
  styleUrl: './language-switcher.css'
})
/**
 * Presentation component that switches the active UI language.
 */
export class LanguageSwitcher {
  currentLang = 'es';
  languages = ['es', 'en'];

  constructor(private translate: TranslateService) {
    this.currentLang = translate.getCurrentLang() || 'es';
  }

  useLanguage(language: string) {
    this.translate.use(language);
    this.currentLang = language;
  }
}
