
export class Registro {

    public format: string;
    public text: string;
    public type: string;
    public icon: string;
    public created_at: Date;
    
    constructor(format: string, text: string) {

        this.format = format;
        this.text = text;

        this.created_at = new Date();

        this.determinarTipo(this.format);
    }

    private determinarTipo( format ) {
        const inicioTexto = this.text.substring(0, 4);
        console.log('tipo: ', inicioTexto);
        
        switch (inicioTexto) {
            case 'http':
                this.type = 'http';
                this.icon = 'globe';
                break;
            case 'geo:':
                this.type = 'geo:';
                this.icon = 'pin';
                break;
            case 'tel:':
                this.type = 'tel:';
                this.icon = 'call';
                break;
            case 'WIFI':
                this.type = 'WIFI';
                this.icon = 'wifi';
                break;
            default:
                this.type = 'Desconocido';
                this.icon = 'alert';
                break;
        }

        
        if(format.includes('EAN') || format.includes('UPC')) {
            console.log('Format: ', format);
            this.type = 'barras';
            this.icon = 'barcode';
        }
    }
}