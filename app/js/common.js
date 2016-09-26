$(document).ready(function() {

	// SVG Fallback
  if(!Modernizr.svg) {
    $("img[src*='svg']").attr("src", function() {
        return $(this).attr("src").replace(".svg", ".png");
    });
  };

  //---------------

  // Magnific Popup
	$('.popup-with-move-anim').magnificPopup({
	//$('.popup-with-zoom-anim').magnificPopup({
		type: 'inline',

		fixedContentPos: false,
		fixedBgPos: true,

		overflowY: 'auto',

		closeBtnInside: true,
		preloader: false,
		
		midClick: true,
		removalDelay: 300,
		mainClass: 'my-mfp-slide-bottom'
		//mainClass: 'my-mfp-zoom-in'
	});

  //---------------

});