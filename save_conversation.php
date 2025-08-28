<?php
// public_html/assets/save_conversation.php
header('Content-Type: application/json; charset=utf-8');

try {
  $dir = __DIR__ . DIRECTORY_SEPARATOR . 'conversaciones con asistente';
  if (!is_dir($dir)) {
    if (!mkdir($dir, 0755, true)) {
      http_response_code(500);
      echo json_encode(['ok'=>false,'error'=>'No se pudo crear el directorio']);
      exit;
    }
  }

  $raw = file_get_contents('php://input');
  if (!$raw) {
    http_response_code(400);
    echo json_encode(['ok'=>false,'error'=>'Body vacío']);
    exit;
  }

  // Nombre: conversacion_YYYY-mm-dd_HH-ii-ss_random.json
  $ts = date('Y-m-d_H-i-s');
  $rand = substr(md5(uniqid('', true)), 0, 6);
  $file = $dir . DIRECTORY_SEPARATOR . "conversacion_{$ts}_{$rand}.json";

  if (file_put_contents($file, $raw) === false) {
    http_response_code(500);
    echo json_encode(['ok'=>false,'error'=>'No se pudo escribir el archivo']);
    exit;
  }

  echo json_encode(['ok'=>true,'file'=>basename($file)]);
} catch (Throwable $e) {
  http_response_code(500);
  echo json_encode(['ok'=>false,'error'=>$e->getMessage()]);
}