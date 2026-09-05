## Verdict - alpha search engine experiment

essential setup:

- create searxng directory at root
- create file `settings.yml`
- add file contents:
```bash
use_default_settings: true

general:
  instance_name: 'Verdict Search Backend'
  privacypolicy_url: false
  donation_url: false
  contact_url: false

search:
  safe_search: 0
  autocomplete: 'google'
  formats:
    - html
    - json

server:
  secret_key: 'random_secret'
  limiter: false
  image_proxy: true

ui:
  static_use_hash: true

```
