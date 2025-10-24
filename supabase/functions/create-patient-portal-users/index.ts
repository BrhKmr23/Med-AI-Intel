import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    // This is a one-time setup function, so we allow it to run without auth
    console.log('Starting patient portal user creation...')

    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    )

    const patients = [
      { id: '11111111-1111-1111-1111-111111111111', name: 'Ravi_patient_1', email: 'ravi_patient_1@hospital.com' },
      { id: '22222222-2222-2222-2222-222222222222', name: 'Priya_patient_2', email: 'priya_patient_2@hospital.com' },
      { id: '33333333-3333-3333-3333-333333333333', name: 'Amit_patient_3', email: 'amit_patient_3@hospital.com' },
      { id: '44444444-4444-4444-4444-444444444444', name: 'Sneha_patient_4', email: 'sneha_patient_4@hospital.com' },
      { id: '55555555-5555-5555-5555-555555555555', name: 'Rajesh_patient_5', email: 'rajesh_patient_5@hospital.com' },
      { id: '66666666-6666-6666-6666-666666666666', name: 'Anita_patient_6', email: 'anita_patient_6@hospital.com' },
    ]

    const credentials = []
    const password = 'Patient@123'

    for (const patient of patients) {
      // Create auth user
      const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
        email: patient.email,
        password: password,
        email_confirm: true,
        user_metadata: {
          full_name: patient.name
        }
      })

      if (authError) {
        console.error(`Error creating auth user for ${patient.name}:`, authError)
        continue
      }

      if (!authData.user) {
        console.error(`No user returned for ${patient.name}`)
        continue
      }

      // Assign patient role
      const { error: roleError } = await supabaseAdmin
        .from('user_roles')
        .insert({
          user_id: authData.user.id,
          role: 'patient',
        })

      if (roleError) {
        console.error(`Error creating role for ${patient.name}:`, roleError)
      }

      // Create portal user entry
      const { error: portalError } = await supabaseAdmin
        .from('patient_portal_users')
        .insert({
          id: authData.user.id,
          patient_id: patient.id,
          email: patient.email,
          is_active: true,
          email_verified: true,
        })

      if (portalError) {
        console.error(`Error creating portal user for ${patient.name}:`, portalError)
      }

      credentials.push({
        name: patient.name,
        email: patient.email,
        password: password,
        patient_id: patient.id,
        auth_user_id: authData.user.id
      })

      console.log(`✅ Created portal access for ${patient.name}`)
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: `Created ${credentials.length} patient portal accounts`,
        credentials: credentials
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )
  } catch (error: any) {
    console.error('Error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    )
  }
})
