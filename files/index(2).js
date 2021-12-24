$(function(){

    $(document).on('window.loaded', function (){
        showPDF();
    });

});

function showPDF(){
    var content = $('#results-pdf-wrapper');
    var spinner = $('#results-spinner');
    var message = $('#results-message');
    var data = getPDF();

    spinner.hide(200, function(){
        if(data === false){
            console.log("PDF content not found");
            message.show();
        }
        else{
            console.log("PDF content loaded");
            initPDF(data, 1, 2);
            initDownloadLink();
            content.show();
        }
    });
}

function getPDF(){
    var target = $('#results-pdf');

    if(target.length == 0)
        return false;
    
    var content = target.attr('data-content');

    if(content === undefined || content == '')
        return false;

    return content;
}

function initDownloadLink(){
    var link = $('#results-download');
    var b64Data = getPDF();

    if(b64Data === false){
        link.attr('href', '#');
        console.log("PDF content for download link not found");

        return false;
    }

    var contentType = 'application/pdf';
    var blob = b64toBlob(b64Data, contentType);
    var blobUrl = URL.createObjectURL(blob);

    link.attr('href', blobUrl);
}

function initPDF(data, pageNumber, scale){

    // atob() is used to convert base64 encoded PDF to binary-like data.
    // (See also https://developer.mozilla.org/en-US/docs/Web/API/WindowBase64/
    // Base64_encoding_and_decoding.)
    var pdfData = atob(data);

    // Loaded via <script> tag, create shortcut to access PDF.js exports.
    var pdfjsLib = window['pdfjs-dist/build/pdf'];

    // The workerSrc property shall be specified.
    pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.6.347/pdf.worker.min.js';

    // Using DocumentInitParameters object to load binary data.
    var loadingTask = pdfjsLib.getDocument({data: pdfData}); console.log(pdfjsLib);
    loadingTask.promise.then(function(pdf) {
    console.log('PDF loaded'); console.log();
    
    // Fetch the first page
    // var pageNumber = 1;
    pdf.getPage(pageNumber).then(function(page) {
        console.log('Page loaded');
        
        // var scale = 2;
        var viewport = page.getViewport({scale: scale});

        // Prepare canvas using PDF page dimensions
        var canvas = document.getElementById('results-pdf');
        var context = canvas.getContext('2d');
        canvas.height = viewport.height;
        canvas.width = viewport.width;

        // Render PDF page into canvas context
        var renderContext = {
        canvasContext: context,
        viewport: viewport
        };
        var renderTask = page.render(renderContext);
        renderTask.promise.then(function () {
        console.log('Page rendered');
        });
    });
    }, function (reason) {
    // PDF loading error
    console.error(reason);
    });
}

function b64toBlob(b64Data, contentType='', sliceSize=512){
    const byteCharacters = atob(b64Data);
    const byteArrays = [];

    for (let offset = 0; offset < byteCharacters.length; offset += sliceSize) {
      const slice = byteCharacters.slice(offset, offset + sliceSize);
      const byteNumbers = new Array(slice.length);

      for (let i = 0; i < slice.length; i++) {
        byteNumbers[i] = slice.charCodeAt(i);
      }

      const byteArray = new Uint8Array(byteNumbers);
      byteArrays.push(byteArray);
    }

    const blob = new Blob(byteArrays, {type: contentType});

    return blob;
}