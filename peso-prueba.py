import serial
import asyncio
import socketio
from aiohttp import web

# Configuración del puerto serial
port = 'COM3'  # Reemplaza con el puerto correcto
baudrate = 9600  # Velocidad en baudios según el manual
timeout = 0.1  # Timeout aumentado para la lectura

# Crear una instancia de Socket.IO server
sio = socketio.AsyncServer(cors_allowed_origins='*')
app = web.Application()
sio.attach(app)

# Definir la función index para la ruta '/'
async def index(request):
    return web.Response(text="Servidor WebSocket en ejecución")

async def send_weight():
    try:
        while True:
            try:
                if not ser.is_open:
                    try:
                        ser.open()
                        print(f"Reconexión serial establecida en el puerto {port}")
                    except serial.SerialException as e:
                        print(f"No se pudo reconectar el puerto {port}: {e}")
                        await asyncio.sleep(5)
                        continue
                    except Exception as e:
                        print(f"Error inesperado al intentar reconectar el puerto: {e}")
                        await asyncio.sleep(5)
                        continue

                # Enviar el comando para solicitar el peso
                print("Enviando comando: b'P\\r\\n'")
                ser.write(b'P\r\n')  # Usa "P" seguido de \r\n

                # Leer la respuesta de la báscula
                line = ser.readline().decode('utf-8').strip()
                print(f"Respuesta recibida de la báscula: '{line}'")

                if line:
                    try:
                        # Extraer el valor numérico
                        weight_str = line.split()[0]  # Suponemos que el peso es el primer elemento
                        weight = float(weight_str)

                        # Enviar el peso
                        message = {'weight': weight}
                        await sio.emit('message', message)
                        print(f"Peso enviado: {weight}")
                    except ValueError:
                        print(f"Error al convertir el peso: '{line}' no es un número válido")
                    except Exception as e:
                        print(f"Error inesperado al procesar el peso: {e}")
                else:
                    # Enviar cero si no se recibió un peso válido
                    message = {'weight': 0}
                    await sio.emit('message', message)
                    print("Peso enviado: 0")

            except serial.SerialException as e:
                print(f"Error al leer o escribir en el puerto serial: {e}")
                await asyncio.sleep(5)
                if ser.is_open:
                    ser.close()
                    print("Conexión serial cerrada para liberar el puerto")
            except PermissionError as e:
                print(f"Permiso denegado para acceder al puerto: {e}")
                if ser.is_open:
                    ser.close()
                    print("Puerto cerrado debido a un error de permisos")
                await asyncio.sleep(5)
            except Exception as e:
                print(f"Error inesperado durante la comunicación serial: {e}")
                if ser.is_open:
                    ser.close()
                    print("Puerto cerrado debido a un error inesperado")
                await asyncio.sleep(5)

            # Disminuir el tiempo de espera antes de la próxima solicitud
            await asyncio.sleep(0.5)

    except Exception as e:
        print(f'Error general en send_weight: {e}')
    finally:
        if ser.is_open:
            ser.close()
            print("Conexión serial cerrada")

app.router.add_get('/', index)

# Manejo de reconexión de WebSocket
@sio.event
async def connect(sid, environ):
    print(f"Cliente conectado: {sid}")
    await sio.emit('message', {'message': 'Conexión establecida'}, to=sid)

@sio.event
async def disconnect(sid):
    print(f"Cliente desconectado: {sid}")

# Iniciar la tarea para enviar el peso
async def start_background_tasks(app):
    loop = asyncio.get_event_loop()
    app['weight_task'] = loop.create_task(send_weight())

app.on_startup.append(start_background_tasks)

if __name__ == '__main__':
    try:
        ser = serial.Serial(port, baudrate, bytesize=serial.EIGHTBITS, parity=serial.PARITY_NONE, stopbits=serial.STOPBITS_ONE, timeout=timeout)
        print(f"Conexión serial establecida en el puerto {port}")
    except serial.SerialException as e:
        print(f"No se pudo abrir el puerto {port}: {e}")
        exit()
    except Exception as e:
        print(f"Error inesperado al abrir el puerto serial: {e}")
        exit()

    web.run_app(app, host='0.0.0.0', port=8765)