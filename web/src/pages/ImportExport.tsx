import { useRef, useState } from 'react'
import * as XLSX from 'xlsx'
import { parseClientesExcel, clientesAExcel } from '../lib/excel'
import { supabase } from '../lib/supabase'

export default function ImportExport() {
  const inputRef = useRef<HTMLInputElement>(null)
  const [resumen, setResumen] = useState<{ ok: number; error: string[] }>({ ok: 0, error: [] })

  async function onFile(file: File) {
    const buf = await file.arrayBuffer()
    const wb = XLSX.read(buf)
    const filas = XLSX.utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]]) as never[]
    const clientes = parseClientesExcel(filas as never)
    const errores: string[] = []
    let ok = 0
    for (const c of clientes) {
      const { error } = await supabase.from('clients').insert(c)
      if (error) errores.push(`${c.nombre}: ${error.message}`)
      else ok++
    }
    setResumen({ ok, error: errores })
    if (inputRef.current) inputRef.current.value = ''
  }

  async function exportar() {
    const { data, error } = await supabase.from('clients').select('*')
    if (error) return
    const wb = clientesAExcel(data ?? [])
    XLSX.writeFile(wb, 'clientes.xlsx')
  }

  return (
    <div className="p-6">
      <h1 className="mb-4 text-2xl font-bold">Importar / Exportar</h1>
      <div className="mb-4 space-x-2">
        <input ref={inputRef} type="file" accept=".xlsx"
          onChange={(e) => e.target.files?.[0] && onFile(e.target.files[0])} />
        <button className="bg-blue-600 p-2 text-white" onClick={exportar}>Exportar Excel</button>
      </div>
      {resumen.ok > 0 && <p className="text-green-600">Importados: {resumen.ok}</p>}
      {resumen.error.map((e, i) => <p key={i} className="text-red-600">{e}</p>)}
    </div>
  )
}