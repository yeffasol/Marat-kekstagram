'use strict';
define(function() {
  /**
   * Конструктор галереи
   * @constructor
   */
  var Gallery = function() {
    /**
     * Галерея на странице
     * @type {HTMLElement}
     */
    this.element = document.querySelector('.gallery-overlay');
    /**
     * Крест для закрытия галереи
     * @type {HTMLElement}
     */
    this.closeButton = this.element.querySelector('.gallery-overlay-close');
    /**
     * Контейнер для фотографии
     * @type {HTMLElement}
     */
    this.photo = document.querySelector('.gallery-overlay-image');
    /**
     * Контейнер для лайков
     * @type {HTMLElement}
     */
    this.likes = document.querySelector('.gallery-overlay-controls-like');
    /**
     * Количество лайков
     * @type {HTMLElement}
     */
    this.likesCount = document.querySelector('.likes-count');
    /**
     * Контейнер для комментариев
     * @type {HTMLElement}
     */
    this.comments = document.querySelector('.gallery-overlay-controls-comments');
    /**
     * список фотографий из json
     * @type {Array}
     */
    this.pictures = [];
    /**
     * Текущая фотография
     * @type {number}
     */
    this.currentPicture = 0;
    /**
     * Подписка на событие нажатия на крестик для загрытия галереи
     * @type {function(this:Gallery)}
     * @private
     */
    this._onCloseClick = this._onCloseClick.bind(this);
    /**
     * Подписка на событие нажатия клавиши на клавиатуре
     * @type {function(this:Gallery)}
     * @private
     */
    this._onDocumentKeyDown = this._onDocumentKeyDown.bind(this);
    /**
     * Подписка на событие клика по фотографии
     * @type {function(this:Gallery)}
     * @private
     */
    this._onPhotoClick = this._onPhotoClick.bind(this);
    /**
     * Подписка на событие лайка фотографии
     * @type {function(this:Gallery)}
     * @private
     */
    this._onSetLike = this._onSetLike.bind(this);
  };
  /** @enum {number} */
  var KEYCODE = {
    'ESC': 27,
    'LEFT': 37,
    'RIGHT': 39
  };
  /**
   * Вызывающий метод для отображения галереи
   * @method
   */
  Gallery.prototype.render = function() {
    var regexp = /#photo\/(\S+)/;
    location.hash = location.hash.match(regexp) ? '' : 'photo/' + this.pictures[this.currentPicture].url;
    window.addEventListener('hashchange', this._onHashChange.bind(this));
    this.restoreFromHash.bind(this);
  };
  /**
   * Устанавливает хеш в адресную строку
   * @method
   */
  Gallery.prototype._onHashChange = function() {
    this.restoreFromHash();
  };
  Gallery.prototype.restoreFromHash = function() {
    if ( location.hash === '') {
      this.hide();
    }else {
      this.show();
      this.setCurrentPicture(this.currentPicture);
    }
  };
  /**
   * Основной метод для отображения галереи
   * @method
   */
  Gallery.prototype.show = function() {
    this.element.classList.remove('invisible');
    this.closeButton.addEventListener('click', this._onCloseClick);
    this.photo.addEventListener('click', this._onPhotoClick);
    this.likes.addEventListener('click', this._onSetLike);
    window.addEventListener('keydown', this._onDocumentKeyDown);
  };
  /**
   * Основной метод закрытия галереи
   * @method
   */
  Gallery.prototype.hide = function() {
    this.element.classList.add('invisible');
    this.closeButton.removeEventListener('click', this._onCloseClick);
    this.photo.removeEventListener('click', this._onPhotoClick);
    this.likes.removeEventListener('click', this._onSetLike);
    window.removeEventListener('keydown', this._onDocumentKeyDown);
  };
  /**
   * Метод события нажатия на клавишу клавиатуры
   * @method
   * @listens click
   * @param {Event} evt - событие нажатия клавиши
   * @private
   */
  Gallery.prototype._onDocumentKeyDown = function(evt) {
    switch (evt.keyCode) {
      case KEYCODE.ESC:
        location.hash = '';
        break;
      case KEYCODE.LEFT: this.setPrevPictureIndex();
        break;
      case KEYCODE.RIGHT:this.setNextPictureIndex();
        break;
    }
    this.setCurrentPicture(this.currentPicture);
  };
  /**
   * Метод массива фотографий из json сохраняет в объекте
   * @method
   * @param {Photo[]} pictures - массив фотографий
   */
  Gallery.prototype.setPictures = function(pictures) {
    this.pictures = pictures;
  };
  /**
   * Метод устанавливает фотографию, которую отображает галерея
   * @method
   *@param {number|string} i - индекс фотографии в массиве или путь до фотографии
   */
  Gallery.prototype.setCurrentPicture = function(i) {
    var picture;
    if (typeof i === 'number') {
      picture = this.pictures[i];
      console.log(1);
    } else {
      picture = this.pictures[this.getNumberPicture(i)];
      console.log(2);
    }
    this.photo.src = picture.url;
    this.likes.querySelector('.likes-count').textContent = picture.likes;
    this.comments.querySelector('.comments-count').textContent = picture.comments;

    if (picture.setLike === true) {
      this.likesCount.classList.add('likes-count-liked');
    } else {
      this.likesCount.classList.remove('likes-count-liked');
    }
  };
  /**
   * Метод события нажатия крестика для закрытия фотогалерии
   * @method
   * @listens click
   * @private
   */
  Gallery.prototype._onCloseClick = function() {
    location.hash = '';
  };
  /**
   * Метод события нажатия на фотогалерею
   * @method
   * @listens click
   * @private
   */
  Gallery.prototype._onPhotoClick = function() {
    this.setCurrentPicture(this.currentPicture);
    this.setNextPictureIndex();
  };
  /**
   * Метод устанавливает объект-фотографию из JSON
   * @method
   * @param {object} data
   */
  Gallery.prototype.setData = function(data) {
    this._data = data;
    this.currentPicture = this.getNumberPicture(data.url);
  };
  /**
   * Метод возвращает номер фотограции в массиве
   * @method
   * @param {string} url - имя фотографии
   * @returns {number}
   */
  Gallery.prototype.getNumberPicture = function(url) {
    for (var i = 0; i < this.pictures.length; i++) {
      if (url === this.pictures[i].url) {
        this.currentPicture = i;
        return i;
      }
    }
  };
  /**
   * Метод устанавливает отображаемой следующюю фотографию
   * @method
   */
  Gallery.prototype.setNextPictureIndex = function() {
    if (this.pictures[this.currentPicture + 1]) {
      location.hash = 'photo/' + this.pictures[++this.currentPicture].url;
    }

  };
  /**
   * Метод устанавливает отображаемой предыдущую фотографию
   * @method
   */
  Gallery.prototype.setPrevPictureIndex = function() {
    if (this.pictures[this.currentPicture - 1]) {
      location.hash = 'photo/' + this.pictures[--this.currentPicture].url;
    }
  };
  /**
   * Метод лайка на фотографии
   * @method
   * @private
   */
  Gallery.prototype._onSetLike = function() {
    var currentObject = this.pictures[this.currentPicture];
    if (currentObject.setLike !== true) {
      currentObject.likes = currentObject.likes + 1;
      this.likesCount.classList.add('likes-count-liked');
      this.likesCount.innerHTML = currentObject.likes;
      currentObject.setLike = true;
    } else {
      currentObject.likes = currentObject.likes - 1;
      this.likesCount.classList.remove('likes-count-liked');
      this.likesCount.innerHTML = currentObject.likes;
      currentObject.setLike = false;
    }
  };

  return Gallery;
});
