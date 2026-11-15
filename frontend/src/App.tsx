import { useEffect, useState, type ChangeEvent, type DragEvent } from "react";

type Prediction = {
  predicted_class: string;
  predicted_index: number;
  probabilities: Record<string, number>;
  disclaimer: string;
};

type ApiStatus = "checking" | "connected" | "disconnected";

type ImageInfo = {
  width: number;
  height: number;
};

function App() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [imageInfo, setImageInfo] = useState<ImageInfo | null>(null);

  const [prediction, setPrediction] = useState<Prediction | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [apiStatus, setApiStatus] = useState<ApiStatus>("checking");
  const [isDragging, setIsDragging] = useState(false);

  // Check backend API connection
  useEffect(() => {
    const checkApi = async () => {
      try {
        const response = await fetch("http://127.0.0.1:8000/health");

        if (!response.ok) throw new Error("API unavailable");

        const data = await response.json();

        setApiStatus(
          data.status === "healthy" && data.model_loaded
            ? "connected"
            : "disconnected",
        );
      } catch (err) {
        console.error("API connection error:", err);
        setApiStatus("disconnected");
      }
    };

    checkApi();
  }, []);

  // Clean up preview URL
  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  // Process selected or dropped image
  const processFile = (file: File) => {
    const allowedTypes = ["image/png", "image/jpeg"];

    if (!allowedTypes.includes(file.type.toLowerCase())) {
      setError("Unsupported file format. Please upload a PNG or JPEG image.");
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setError(
        "Image is too large. Please upload an image smaller than 10 MB.",
      );
      return;
    }

    const newPreviewUrl = URL.createObjectURL(file);
    const image = new Image();

    image.onload = () => {
      setSelectedFile(file);
      setPreviewUrl(newPreviewUrl);

      setImageInfo({
        width: image.naturalWidth,
        height: image.naturalHeight,
      });

      setPrediction(null);
      setError(null);
    };

    image.onerror = () => {
      URL.revokeObjectURL(newPreviewUrl);
      setError(
        "Unable to read this image. Please choose a valid PNG or JPEG file.",
      );
    };

    image.src = newPreviewUrl;
  };

  // Handle normal file selection
  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];

    if (file) {
      processFile(file);
    }

    event.target.value = "";
  };

  // Handle drag over
  const handleDragOver = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    setIsDragging(true);
  };

  // Handle leaving upload area
  const handleDragLeave = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    setIsDragging(false);
  };

  // Handle dropped image
  const handleDrop = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    setIsDragging(false);

    const file = event.dataTransfer.files?.[0];

    if (!file) return;

    processFile(file);
  };

  // Send image to backend for prediction
  // Keep loading animation visible for at least 800 ms
  const handlePredict = async () => {
    if (!selectedFile || isLoading) return;

    setIsLoading(true);
    setError(null);
    setPrediction(null);

    const startTime = Date.now();

    try {
      const formData = new FormData();
      formData.append("file", selectedFile);

      const response = await fetch("http://127.0.0.1:8000/predict", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || "Prediction failed.");
      }

      setPrediction(data);
    } catch (err) {
      console.error("Prediction error:", err);
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      const elapsedTime = Date.now() - startTime;
      const remainingTime = Math.max(0, 800 - elapsedTime);

      await new Promise<void>((resolve) => {
        setTimeout(resolve, remainingTime);
      });

      setIsLoading(false);
    }
  };

  // Remove selected image
  const handleRemoveImage = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    setImageInfo(null);
    setPrediction(null);
    setError(null);
  };

  // Sort probabilities from highest to lowest
  const sortedProbabilities = prediction
    ? Object.entries(prediction.probabilities).sort((a, b) => b[1] - a[1])
    : [];

  // Format file size
  const formatFileSize = (bytes: number) => {
    return bytes < 1024 * 1024
      ? `${(bytes / 1024).toFixed(2)} KB`
      : `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  return (
    <div className="min-h-screen bg-[#080d19] text-slate-100">
      {/* Header */}
      <header className="sticky top-0 z-20 border-b border-white/10 bg-[#080d19]/90 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4 sm:px-8">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-600 text-xl shadow-lg shadow-blue-900/40">
              ✦
            </div>

            <div>
              <h1 className="text-xl font-bold tracking-tight">MedVision</h1>
              <p className="text-xs text-slate-500">AI Image Intelligence</p>
            </div>
          </div>

          {/* API Status */}
          <div className="flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-2">
            <span
              className={`h-2 w-2 rounded-full ${
                apiStatus === "connected"
                  ? "bg-emerald-400"
                  : apiStatus === "checking"
                    ? "animate-pulse bg-yellow-400"
                    : "bg-red-400"
              }`}
            />

            <span className="text-xs font-medium text-slate-300">
              {apiStatus === "connected"
                ? "System Online"
                : apiStatus === "checking"
                  ? "Connecting..."
                  : "System Offline"}
            </span>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-5 py-10 sm:px-8 sm:py-14">
        {/* Hero */}
        <section className="mb-10">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-blue-500/20 bg-blue-500/10 px-3 py-1.5 text-xs font-medium text-blue-300">
            <span>✦</span>
            Deep Learning · Histopathology
          </div>

          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Medical Image Analysis
          </h2>

          <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-400 sm:text-base">
            Analyze histopathology images using a convolutional neural network
            trained to classify nine different tissue categories.
          </p>
        </section>

        {/* Dashboard Overview */}
        <section className="mb-10 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            {
              label: "Model Architecture",
              value: "CNN V2.1",
              detail: "Deep learning model",
              icon: "🧠",
            },
            {
              label: "Tissue Categories",
              value: "09",
              detail: "Classification classes",
              icon: "🔬",
            },
            {
              label: "Training Images",
              value: "89,996",
              detail: "PathMNIST dataset",
              icon: "🗂️",
            },
            {
              label: "Model Parameters",
              value: "111K",
              detail: "Trainable parameters",
              icon: "⚙️",
            },
          ].map((item) => (
            <div
              key={item.label}
              className="rounded-2xl border border-white/10 bg-[#111a2b] p-5 transition hover:border-blue-500/30"
            >
              <div className="flex items-center justify-between">
                <p className="text-sm text-slate-400">{item.label}</p>
                <span className="text-xl">{item.icon}</span>
              </div>
              <p className="mt-4 text-2xl font-bold tracking-tight">
                {item.value}
              </p>
              <p className="mt-1 text-xs text-slate-500">{item.detail}</p>
            </div>
          ))}
        </section>

        {/* Main Workspace */}
        <section className="grid grid-cols-1 gap-6 lg:grid-cols-5">
          {/* Upload Panel */}
          <div className="rounded-2xl border border-white/10 bg-[#111a2b] p-6 sm:p-7 lg:col-span-2">
            <div className="mb-6">
              <p className="text-xs font-semibold uppercase tracking-widest text-blue-400">
                Step 01
              </p>
              <h3 className="mt-2 text-xl font-bold">Image Input</h3>
              <p className="mt-2 text-sm text-slate-400">
                Upload a histopathology image to begin analysis.
              </p>
            </div>

            <input
              id="image-upload"
              type="file"
              accept=".png,.jpg,.jpeg,image/png,image/jpeg"
              onChange={handleFileChange}
              className="hidden"
            />

            {!selectedFile ? (
              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                className={`flex min-h-72 flex-col items-center justify-center rounded-xl border-2 border-dashed px-5 py-10 text-center transition ${
                  isDragging
                    ? "border-blue-400 bg-blue-500/10"
                    : "border-slate-700 bg-[#0b1220] hover:border-blue-500/50"
                }`}
              >
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-500/10 text-3xl">
                  {isDragging ? "⬇️" : "📁"}
                </div>

                <h4 className="mt-5 font-semibold">
                  {isDragging ? "Drop your image here" : "Upload your image"}
                </h4>

                <p className="mt-2 max-w-xs text-xs leading-6 text-slate-500">
                  Drag and drop a histopathology image here, or browse files
                  from your device.
                </p>

                <label
                  htmlFor="image-upload"
                  className="mt-6 cursor-pointer rounded-lg bg-blue-600 px-6 py-3 text-sm font-semibold transition hover:bg-blue-500"
                >
                  Browse Files
                </label>

                <p className="mt-4 text-xs text-slate-600">
                  PNG · JPG · JPEG · Max 10 MB
                </p>
              </div>
            ) : (
              <div>
                <div
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  className={`overflow-hidden rounded-xl border bg-[#0b1220] p-3 transition ${
                    isDragging
                      ? "border-blue-400 bg-blue-500/10"
                      : "border-white/10"
                  }`}
                >
                  {isDragging ? (
                    <div className="flex h-64 items-center justify-center text-sm font-medium text-blue-300">
                      Drop to replace current image
                    </div>
                  ) : (
                    previewUrl && (
                      <img
                        src={previewUrl}
                        alt="Selected histopathology image"
                        className="mx-auto h-64 w-full rounded-lg object-contain"
                      />
                    )
                  )}
                </div>

                <p className="mt-4 break-all text-sm font-medium text-slate-200">
                  {selectedFile.name}
                </p>

                <div className="mt-5 grid grid-cols-2 gap-3">
                  <div className="rounded-lg bg-[#0b1220] p-3">
                    <p className="text-xs text-slate-500">Dimensions</p>
                    <p className="mt-1 text-sm font-medium">
                      {imageInfo
                        ? `${imageInfo.width} × ${imageInfo.height}`
                        : "Loading..."}
                    </p>
                  </div>

                  <div className="rounded-lg bg-[#0b1220] p-3">
                    <p className="text-xs text-slate-500">File Size</p>
                    <p className="mt-1 text-sm font-medium">
                      {formatFileSize(selectedFile.size)}
                    </p>
                  </div>
                </div>

                <div className="mt-4 flex gap-3">
                  <label
                    htmlFor="image-upload"
                    className="flex-1 cursor-pointer rounded-lg border border-slate-700 py-2.5 text-center text-sm font-medium transition hover:bg-white/5"
                  >
                    Change Image
                  </label>

                  <button
                    type="button"
                    onClick={handleRemoveImage}
                    className="rounded-lg border border-red-500/30 px-4 py-2.5 text-sm text-red-400 transition hover:bg-red-500/10"
                  >
                    Remove
                  </button>
                </div>
              </div>
            )}

            {error && (
              <p className="mt-4 rounded-lg border border-red-500/20 bg-red-500/10 p-3 text-sm text-red-400">
                {error}
              </p>
            )}

            <button
              type="button"
              onClick={handlePredict}
              disabled={!selectedFile || isLoading || apiStatus !== "connected"}
              className="mt-6 w-full rounded-lg bg-blue-600 px-6 py-3.5 text-sm font-semibold shadow-lg shadow-blue-950/30 transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-40"
            >
              {isLoading ? "Analyzing Image..." : "✦  Analyze Image"}
            </button>

            {apiStatus !== "connected" && (
              <p className="mt-3 text-center text-xs text-slate-500">
                Waiting for the backend model connection.
              </p>
            )}

            {isLoading && (
              <div className="mt-4 flex items-center justify-center gap-3 rounded-lg border border-blue-500/20 bg-blue-500/5 p-4">
                <div className="h-5 w-5 animate-spin rounded-full border-2 border-blue-400/30 border-t-blue-400" />
                <p className="text-sm font-medium text-blue-300">
                  Processing your image with the CNN model...
                </p>
              </div>
            )}
          </div>

          {/* Results Panel */}
          <div className="rounded-2xl border border-white/10 bg-[#111a2b] p-6 sm:p-7 lg:col-span-3">
            <div className="mb-6">
              <p className="text-xs font-semibold uppercase tracking-widest text-blue-400">
                Step 02
              </p>
              <h3 className="mt-2 text-xl font-bold">Analysis Results</h3>
              <p className="mt-2 text-sm text-slate-400">
                Model predictions and tissue classification probabilities.
              </p>
            </div>

            {isLoading ? (
              <div className="flex min-h-80 flex-col items-center justify-center rounded-xl border border-blue-500/20 bg-[#0b1220] px-6 text-center">
                <div className="relative flex h-20 w-20 items-center justify-center">
                  <div className="absolute h-20 w-20 animate-spin rounded-full border-4 border-blue-500/20 border-t-blue-400" />
                  <span className="text-3xl">🔬</span>
                </div>

                <h4 className="mt-6 font-semibold text-blue-300">
                  Analyzing Image...
                </h4>

                <p className="mt-2 max-w-sm text-sm leading-6 text-slate-500">
                  Your image is being processed by the MedVision CNN model.
                  Please wait for the classification results.
                </p>

                <div className="mt-6 h-1.5 w-48 overflow-hidden rounded-full bg-slate-800">
                  <div className="h-full w-1/2 animate-pulse rounded-full bg-blue-400" />
                </div>
              </div>
            ) : !prediction ? (
              <div className="flex min-h-80 flex-col items-center justify-center rounded-xl border border-white/5 bg-[#0b1220] px-6 text-center">
                <div className="flex h-20 w-20 items-center justify-center rounded-full bg-blue-500/10 text-4xl">
                  🔬
                </div>

                <h4 className="mt-6 font-semibold text-slate-200">
                  Awaiting Image Analysis
                </h4>

                <p className="mt-2 max-w-sm text-sm leading-6 text-slate-500">
                  Your prediction results will appear here after you upload an
                  image and run the analysis.
                </p>
              </div>
            ) : (
              <div>
                {/* Main Prediction */}
                <div className="rounded-xl border border-emerald-400/40 bg-gradient-to-br from-emerald-500/15 to-blue-500/5 p-5 shadow-lg shadow-emerald-950/10 result-enter sm:p-6">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-emerald-400">
                      <span className="inline-flex h-6 w-6 check-enter items-center justify-center rounded-full bg-emerald-400/15 text-sm">
                        ✓
                      </span>
                      Predicted Tissue Class
                    </div>

                    <span className="rounded-full border border-emerald-400/30 bg-emerald-400/10 px-3 py-1 text-xs font-semibold text-emerald-300">
                      Analysis Complete
                    </span>
                  </div>

                  <h4 className="mt-4 text-2xl font-bold tracking-tight text-emerald-300 sm:text-3xl">
                    {prediction.predicted_class}
                  </h4>

                  <p className="mt-2 text-xs text-slate-400">
                    Class index: {prediction.predicted_index}
                  </p>

                  <div className="mt-4 inline-flex items-center gap-2 rounded-lg bg-emerald-400/10 px-3 py-2 text-xs font-medium text-emerald-300">
                    <span>★</span>
                    Highest predicted probability
                  </div>
                </div>

                {/* Top 3 */}
                <div className="mt-7">
                  <h4 className="font-semibold">Top 3 Predictions</h4>

                  <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
                    {sortedProbabilities
                      .slice(0, 3)
                      .map(([className, probability], index) => {
                        const isPredicted =
                          className === prediction.predicted_class;

                        return (
                          <div
                            key={className}
                            className={`rounded-xl border p-4 transition duration-300 hover:-translate-y-1 ${
                              isPredicted
                                ? "border-emerald-400/40 bg-emerald-500/10 shadow-md shadow-emerald-950/20"
                                : "border-white/10 bg-[#0b1220] hover:border-blue-500/30"
                            }`}
                          >
                            <div className="flex items-center justify-between gap-2">
                              <p className="text-xs text-slate-500">
                                Rank #{index + 1}
                              </p>

                              {isPredicted && (
                                <span className="rounded-full bg-emerald-400/15 px-2 py-1 text-[9px] font-bold tracking-wide text-emerald-300">
                                  MODEL PREDICTION
                                </span>
                              )}
                            </div>

                            <p className="mt-3 min-h-10 text-sm font-semibold">
                              {className}
                            </p>

                            <p
                              className={`mt-2 text-xl font-bold ${
                                isPredicted
                                  ? "text-emerald-400"
                                  : "text-blue-400"
                              }`}
                            >
                              {(probability * 100).toFixed(2)}%
                            </p>
                          </div>
                        );
                      })}
                  </div>
                </div>

                {/* All Probabilities */}
                <div className="mt-8">
                  <div className="flex items-center justify-between">
                    <h4 className="font-semibold">Class Probabilities</h4>
                    <span className="text-xs text-slate-500">9 classes</span>
                  </div>

                  <div className="mt-5 space-y-5">
                    {sortedProbabilities.map(([className, probability]) => {
                      const isPredicted =
                        className === prediction.predicted_class;

                      return (
                        <div key={className}>
                          <div className="mb-2 flex items-center justify-between gap-3 text-sm">
                            <div className="flex flex-wrap items-center gap-2">
                              <span
                                className={
                                  isPredicted
                                    ? "font-semibold text-emerald-300"
                                    : "text-slate-300"
                                }
                              >
                                {className}
                              </span>

                              {isPredicted && (
                                <span className="rounded-full bg-emerald-400/10 px-2 py-0.5 text-[9px] font-bold text-emerald-300">
                                  PREDICTED
                                </span>
                              )}
                            </div>

                            <span
                              className={`font-medium tabular-nums ${
                                isPredicted
                                  ? "text-emerald-400"
                                  : "text-slate-400"
                              }`}
                            >
                              {(probability * 100).toFixed(2)}%
                            </span>
                          </div>

                          <div className="h-2 overflow-hidden rounded-full bg-slate-800">
                            <div
                              className={`h-full rounded-full transition-all duration-1000 ease-out ${
                                isPredicted
                                  ? "bg-emerald-400 shadow-sm shadow-emerald-400/40"
                                  : "bg-blue-500"
                              }`}
                              style={{
                                width: `${probability * 100}%`,
                              }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Prediction Disclaimer */}
                <div className="mt-8 rounded-lg border border-white/10 bg-[#0b1220] p-4">
                  <p className="text-xs leading-6 text-slate-400">
                    {prediction.disclaimer}
                  </p>
                </div>
              </div>
            )}
          </div>
        </section>

        {/* Footer Disclaimer */}
        <section className="mt-8 rounded-xl border border-amber-500/20 bg-amber-500/5 p-4">
          <div className="flex items-start gap-3">
            <span className="text-lg">ⓘ</span>
            <div>
              <h4 className="text-sm font-semibold text-amber-300">
                Research and Educational Use Only
              </h4>
              <p className="mt-1 text-xs leading-6 text-slate-400">
                MedVision is an educational deep learning prototype. It is not
                clinically validated and must not be used for medical diagnosis,
                treatment decisions, or clinical interpretation. Model
                probabilities are not medically calibrated confidence scores.
              </p>
            </div>
          </div>
        </section>

        <footer className="mt-10 border-t border-white/10 pt-6 text-center">
          <p className="text-xs text-slate-600">
            MedVision · CNN V2.1 · PathMNIST · Built with PyTorch, FastAPI and
            React
          </p>
        </footer>
      </main>
    </div>
  );
}

export default App;
