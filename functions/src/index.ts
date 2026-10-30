import { setGlobalOptions } from "firebase-functions";

// Límite de instancias para controlar costos ante picos de tráfico.
setGlobalOptions({ maxInstances: 10 });

// Fase 2: aquí vivirán las Cloud Functions de pedidos, stock y comisiones.
