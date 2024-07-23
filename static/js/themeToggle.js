function ThemeToggle(toggleID) {

    this.toggleForm = document.getElementById(toggleID) || null;
    this.body = document.body
    this.toggle = this.toggleForm.querySelector('input[type="checkbox"]') || this.toggleForm.closest('input[type="checkbox"]')

    this.events = function() {
        if (!this.toggleForm) return null
      this.loadThemeFromStorage()
      this.toggleForm.addEventListener('click', this.handleChange.bind(this)) 
      document.addEventListener('keyup', this.handleKeyDown.bind(this))
    }
        
        
    this.handleKeyDown = function(e) {
      
      if(e.key === 't' || e.key === 'T') {
      this.handleChange()
  }
    }.bind(this)


    this.loadThemeFromStorage = function() {
      var getThemeFromLocalStorage = localStorage.getItem('theme') || "light"
      this.toggle.checked = getThemeFromLocalStorage === "dark"
        document.body.setAttribute('data-theme', getThemeFromLocalStorage)
    }


    this.handleChange = function() {
      if (typeof this.toggle === "undefined") return null

      if (this.toggle.checked) {
        this.toggle.checked = false
        this.toggle.setAttribute('aria-label', 'light')
        this.body.setAttribute('data-theme', 'light')
        localStorage.setItem("theme", "light")
    } else {
      this.toggle.checked = true
      this.toggle.setAttribute('aria-label', 'dark')
      this.body.setAttribute('data-theme', 'dark')
      localStorage.setItem("theme", "dark")
    }

    }
    this.events()
  }



  // init

  new ThemeToggle('themeForm')


 