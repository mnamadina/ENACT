$(document).ready(function () {
    "use strict";

    function navScroll() {
        let window_top = $(window).scrollTop();
        let div_top = $('body').offset().top;
        if (window_top > div_top) {
            $('.header').addClass('header--sticky');
            $('.header__menu ul ul').addClass('submenu-header-sticky');
        } else {
            $('.header').removeClass('header--sticky');
            $('.header__menu ul ul').removeClass('submenu-header-sticky');
        }
    }

    $(window).scroll(function () {
        navScroll();
    });
    navScroll();

    // $(document).on("scroll", onScroll);

    let delegate = function (criteria, listener) {
        return function (e) {
            let el = e.target;
            do {
                if (!criteria(el)) continue;
                e.delegateTarget = el;
                listener.apply(this, arguments);
                return;
            } while ((el = el.parentNode));
        };
    };
    let toolbar = document.querySelector(".header__menu");
    let buttonsFilter = function (elem) {
        return elem.classList && elem.classList.contains("header-link");
    };
    let buttonHandler = function (e) {
        let button = e.delegateTarget;
        if (!button.classList.contains("active")) {
            button.classList.add("active");
            let target = button.hash;
            let $target = $(target);

            $('html, body').stop().animate({
                'scrollTop': $target.offset().top
            }, 600, 'swing', function () {
                window.location.hash = target;
                // $(document).on("scroll", onScroll);
            });
        } else {
            button.classList.remove("active");
        }
    };
    toolbar.addEventListener("click", delegate(buttonsFilter, buttonHandler));

    $.fn.menumaker = function (options) {

        let cssmenu = $(this), settings = $.extend({
            title: "Menu",
            format: "dropdown",
            sticky: false
        }, options);

        return this.each(function () {
            cssmenu.prepend('<div class="menu-button"></div>');
            $(this).find(".menu-button").on('click', function () {
                $(this).parent().parent().parent().toggleClass('menu-open');

                let mainmenu = $(this).next('ul');
                mainmenu.toggleClass('open');
                if (mainmenu.hasClass('open')) {
                    mainmenu.show();
                } else {
                    mainmenu.hide();
                }
                $('.header__menu ul a[href^="#"]').on('click', function (e) {
                    $('.header__menu ul').removeClass('open');
                    $('.header__menu ul').hide();
                    $('.header').removeClass('menu-open');
                });
            });

            let multiTg = function () {
                cssmenu.find(".menu-item-has-children").prepend('<span class="submenu-button"></span>');
                cssmenu.find('.submenu-button').on('click', function () {
                    $(this).toggleClass('submenu-opened');
                    if ($(this).siblings('ul').hasClass('open')) {
                        $(this).siblings('ul').removeClass('open').hide();
                    } else {
                        $(this).siblings('ul').addClass('open').show();
                    }
                });
            };

            if (settings.format === 'multitoggle') multiTg();
            else cssmenu.addClass('dropdown');

            if (settings.sticky === true) cssmenu.addClass('sticky');

        });
    };

    $(".header__menu").menumaker({
        format: "multitoggle",
        sticky: true
    });

});
