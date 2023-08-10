import React, { useEffect, useState } from 'react';
import pdfjsWorker from 'pdfjs-dist/build/pdf.worker.entry';
import "./index.css"

const App = () => {
  window.pdfjsLib.GlobalWorkerOptions.workerSrc = pdfjsWorker;

  const [modal, setModal] = useState(false);
  const [text, setText] = useState('');

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      const result = event.target.result;
      const text = await extractTextFromPDF(result);
      setText(text);
    };
    reader.readAsArrayBuffer(file);
  };

  const extractTextFromPDF = async (fileData) => {
    try {
      const loadingTask = window.pdfjsLib.getDocument({ data: fileData });
      const pdf = await loadingTask.promise;
      let fullText = '';
      const numPages = pdf.numPages;

      for (let pageNum = 1; pageNum <= numPages; pageNum++) {
        const page = await pdf.getPage(pageNum);
        const content = await page.getTextContent();
        const pageText = content.items.map((item) => item.str).join(' ');
        fullText += pageText + '\n';
      }

      return fullText;
    } catch (error) {
      console.error('Error extracting text from PDF:', error);
      return 'Error extracting text from the PDF.';
    }
  };
  useEffect(() => {
    if (!text) {
      setModal(false)
    }
  }, [text])

  const downloadTextAsFile = (text, filename) => {
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();
    URL.revokeObjectURL(url);
  };


  function returnText() {
    return (
      <p className='overflow-auto'>
        {text}
      </p>
    )
  }
  return (

    <>
      <div className="min-h-screen h-full  bg-gray-100 flex items-center justify-start pt-[10%] flex-col">
        <div className="bg-white  p-8 rounded-lg shadow-md max-w-md w-full h-full">
          <h1 className="text-2xl font-bold mb-6">PDF to Text Converter</h1>
          <input
            type="file"
            accept=".pdf"
            className="border py-2 px-4 rounded-lg w-full mb-4"
            onChange={handleFileChange}
          />

        </div>
        <div className={`${text.length == 0 && "hidden"} bg-gray-200 border-[1px] border-[rgb(0,0,0,0.1)] mt-4 p-2 sm:p-4 md:p-8 rounded-lg shadow-md max-w-[95%] sm:max-w-[90%] w-full h-full`}>
          <div className='w-full h-full'>
            <div className={`bg-gray-100 text-gray-800 border-[1px] border-[rgb(0,0,0,0.1)] p-2  rounded-lg h-full w-full `}>
              {returnText()}
            </div>
          </div>
          <div className=" w-full flex justify-center items-center p-1 mt-2">
            <button className="
             border-[1px] border-[rgb(0,0,0,0.1)] text-[rgb(0,0,0,0.8)] text-[0.95rem]
             duration-300 ease-in-out bg-gray-200 hover:bg-[rgb(219,221,245)] hover:border-[rgb(0,0,0,0.2)] hover:text-[rgb(0,0,0,0.7)] mx-auto w-[10rem] rounded-[5px] h-[2rem]" onClick={() => { downloadTextAsFile(text, "pdfintext") }}>BAIXAR</button>
          </div>

        </div>

      
      </div>


      <button className="bg-red-500 hidden absolute top-[2%] right-[2%] w-[2rem] h-[2rem]" onClick={() => { setModal(!modal) }}>Mostrar</button>
    </>
  );
};

export default App;
