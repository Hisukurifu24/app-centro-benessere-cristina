#!/bin/bash

# Script per ridimensionare screenshot per App Store
# Dimensione target: 1284 x 2778px (iPhone 6.5")

echo "🖼️  Ridimensionamento screenshot per App Store..."

# Crea cartella output
mkdir -p ~/Desktop/AppStore-Screenshots

# Trova tutti gli screenshot di iPhone sul Desktop
count=0
for file in ~/Desktop/Simulator\ Screenshot\ -\ iPhone*.png; do
    if [ -f "$file" ]; then
        filename=$(basename "$file")
        output_name="screenshot_$((count + 1)).png"
        
        echo "Elaborando: $filename"
        
        # Ridimensiona a 1284x2778 usando sips (built-in macOS)
        sips -z 2778 1284 "$file" --out ~/Desktop/AppStore-Screenshots/"$output_name" > /dev/null 2>&1
        
        if [ $? -eq 0 ]; then
            echo "✅ Salvato: $output_name"
            ((count++))
        else
            echo "❌ Errore con: $filename"
        fi
    fi
done

if [ $count -gt 0 ]; then
    echo ""
    echo "✨ Completato! $count screenshot ridimensionati"
    echo "📁 Trova gli screenshot in: ~/Desktop/AppStore-Screenshots/"
    echo ""
    echo "Dimensioni: 1284 x 2778px (iPhone 6.5\")"
else
    echo ""
    echo "❌ Nessuno screenshot trovato sul Desktop"
    echo "Fai gli screenshot con iPhone 17 Pro Max prima di eseguire questo script"
fi
