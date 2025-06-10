"use client"

import type React from "react"

import { useState, useRef, useCallback } from "react"
import { Camera, Scan, Save, BarChart3, History, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { toast } from "@/hooks/use-toast"

interface NutritionalData {
  id: string
  productName: string
  timestamp: Date
  calories: number
  proteins: number
  carbohydrates: number
  fats: number
  fiber: number
  sugar: number
  sodium: number
  servingSize: string
}

export default function NutritionScanner() {
  const [isScanning, setIsScanning] = useState(false)
  const [capturedImage, setCapturedImage] = useState<string | null>(null)
  const [extractedData, setExtractedData] = useState<NutritionalData | null>(null)
  const [savedProducts, setSavedProducts] = useState<NutritionalData[]>([])
  const [isProcessing, setIsProcessing] = useState(false)
  const [activeTab, setActiveTab] = useState("scanner")
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Simular OCR - em produção seria uma API real
  const simulateOCR = useCallback((imageData: string): NutritionalData => {
    const mockProducts = [
      {
        productName: "Iogurte Natural",
        calories: 65,
        proteins: 3.5,
        carbohydrates: 4.8,
        fats: 3.2,
        fiber: 0,
        sugar: 4.8,
        sodium: 50,
        servingSize: "100g",
      },
      {
        productName: "Cereais Integrais",
        calories: 350,
        proteins: 12,
        carbohydrates: 65,
        fats: 4.5,
        fiber: 8,
        sugar: 12,
        sodium: 380,
        servingSize: "100g",
      },
      {
        productName: "Sumo de Laranja",
        calories: 45,
        proteins: 0.7,
        carbohydrates: 10.4,
        fats: 0.2,
        fiber: 0.2,
        sugar: 8.1,
        sodium: 1,
        servingSize: "100ml",
      },
    ]

    const randomProduct = mockProducts[Math.floor(Math.random() * mockProducts.length)]

    return {
      id: Date.now().toString(),
      timestamp: new Date(),
      ...randomProduct,
    }
  }, [])

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" },
      })
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        setIsScanning(true)
      }
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível aceder à câmara",
        variant: "destructive",
      })
    }
  }

  const stopCamera = () => {
    if (videoRef.current?.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream
      stream.getTracks().forEach((track) => track.stop())
      videoRef.current.srcObject = null
    }
    setIsScanning(false)
  }

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const canvas = canvasRef.current
      const video = videoRef.current
      const context = canvas.getContext("2d")

      canvas.width = video.videoWidth
      canvas.height = video.videoHeight

      if (context) {
        context.drawImage(video, 0, 0)
        const imageData = canvas.toDataURL("image/jpeg")
        setCapturedImage(imageData)
        processImage(imageData)
        stopCamera()
      }
    }
  }

  const processImage = async (imageData: string) => {
    setIsProcessing(true)

    // Simular processamento OCR
    setTimeout(() => {
      const data = simulateOCR(imageData)
      setExtractedData(data)
      setIsProcessing(false)
      toast({
        title: "Sucesso!",
        description: "Dados nutricionais extraídos com sucesso",
      })
    }, 2000)
  }

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        const imageData = e.target?.result as string
        setCapturedImage(imageData)
        processImage(imageData)
      }
      reader.readAsDataURL(file)
    }
  }

  const saveProduct = () => {
    if (extractedData) {
      setSavedProducts((prev) => [...prev, extractedData])
      toast({
        title: "Guardado!",
        description: "Produto guardado com sucesso",
      })
    }
  }

  const clearResults = () => {
    setCapturedImage(null)
    setExtractedData(null)
  }

  const NutritionalCard = ({ data }: { data: NutritionalData }) => (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          {data.productName}
          <Badge variant="secondary">{data.servingSize}</Badge>
        </CardTitle>
        <CardDescription>Analisado em {data.timestamp.toLocaleDateString("pt-PT")}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-sm font-medium">Calorias:</span>
              <span className="text-sm">{data.calories} kcal</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm font-medium">Proteínas:</span>
              <span className="text-sm">{data.proteins}g</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm font-medium">Hidratos:</span>
              <span className="text-sm">{data.carbohydrates}g</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm font-medium">Gorduras:</span>
              <span className="text-sm">{data.fats}g</span>
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-sm font-medium">Fibra:</span>
              <span className="text-sm">{data.fiber}g</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm font-medium">Açúcar:</span>
              <span className="text-sm">{data.sugar}g</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm font-medium">Sódio:</span>
              <span className="text-sm">{data.sodium}mg</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto p-4 max-w-md">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-center mb-2">Scanner Nutricional</h1>
          <p className="text-muted-foreground text-center text-sm">
            Digitalize rótulos e obtenha informações nutricionais
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="scanner" className="flex items-center gap-2">
              <Scan className="w-4 h-4" />
              Scanner
            </TabsTrigger>
            <TabsTrigger value="results" className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4" />
              Resultados
            </TabsTrigger>
            <TabsTrigger value="history" className="flex items-center gap-2">
              <History className="w-4 h-4" />
              Histórico
            </TabsTrigger>
          </TabsList>

          <TabsContent value="scanner" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Digitalizar Produto</CardTitle>
                <CardDescription>Use a câmara ou carregue uma imagem do rótulo</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {!isScanning && !capturedImage && (
                  <div className="space-y-3">
                    <Button onClick={startCamera} className="w-full" size="lg">
                      <Camera className="w-5 h-5 mr-2" />
                      Abrir Câmara
                    </Button>

                    <div className="relative">
                      <div className="absolute inset-0 flex items-center">
                        <span className="w-full border-t" />
                      </div>
                      <div className="relative flex justify-center text-xs uppercase">
                        <span className="bg-background px-2 text-muted-foreground">ou</span>
                      </div>
                    </div>

                    <Button
                      onClick={() => fileInputRef.current?.click()}
                      variant="outline"
                      className="w-full"
                      size="lg"
                    >
                      Carregar Imagem
                    </Button>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                  </div>
                )}

                {isScanning && (
                  <div className="space-y-4">
                    <div className="relative">
                      <video ref={videoRef} autoPlay playsInline className="w-full rounded-lg" />
                      <div className="absolute inset-0 border-2 border-primary rounded-lg pointer-events-none">
                        <div className="absolute top-4 left-4 w-6 h-6 border-l-2 border-t-2 border-primary"></div>
                        <div className="absolute top-4 right-4 w-6 h-6 border-r-2 border-t-2 border-primary"></div>
                        <div className="absolute bottom-4 left-4 w-6 h-6 border-l-2 border-b-2 border-primary"></div>
                        <div className="absolute bottom-4 right-4 w-6 h-6 border-r-2 border-b-2 border-primary"></div>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button onClick={capturePhoto} className="flex-1">
                        <Scan className="w-4 h-4 mr-2" />
                        Capturar
                      </Button>
                      <Button onClick={stopCamera} variant="outline">
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                )}

                {capturedImage && (
                  <div className="space-y-4">
                    <img
                      src={capturedImage || "/placeholder.svg"}
                      alt="Imagem capturada"
                      className="w-full rounded-lg"
                    />
                    {isProcessing && (
                      <div className="text-center py-4">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
                        <p className="text-sm text-muted-foreground">A processar imagem...</p>
                      </div>
                    )}
                    <Button onClick={clearResults} variant="outline" className="w-full">
                      Nova Digitalização
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="results" className="space-y-4">
            {extractedData ? (
              <div className="space-y-4">
                <NutritionalCard data={extractedData} />
                <div className="flex gap-2">
                  <Button onClick={saveProduct} className="flex-1">
                    <Save className="w-4 h-4 mr-2" />
                    Guardar
                  </Button>
                  <Button onClick={() => setActiveTab("scanner")} variant="outline">
                    Nova Análise
                  </Button>
                </div>
              </div>
            ) : (
              <Card>
                <CardContent className="text-center py-8">
                  <BarChart3 className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-muted-foreground">Nenhum resultado disponível</p>
                  <p className="text-sm text-muted-foreground mt-2">
                    Digitalize um produto para ver os dados nutricionais
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="history" className="space-y-4">
            {savedProducts.length > 0 ? (
              <div className="space-y-4">
                {savedProducts.map((product) => (
                  <NutritionalCard key={product.id} data={product} />
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="text-center py-8">
                  <History className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-muted-foreground">Nenhum produto guardado</p>
                  <p className="text-sm text-muted-foreground mt-2">Os produtos digitalizados aparecerão aqui</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>

        <canvas ref={canvasRef} className="hidden" />
      </div>
    </div>
  )
}
