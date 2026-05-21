const fs = require('fs');
const path = require('path');

const files = [
  'app/api/automations/[id]/route.ts',
  'app/api/calls/[id]/route.ts',
  'app/api/contacts/[id]/engagement/log/route.ts',
  'app/api/contacts/[id]/route.ts',
  'app/api/deals/assignments/[id]/route.ts',
  'app/api/deals/[id]/contacts/route.ts',
  'app/api/deals/[id]/emails/route.ts',
  'app/api/deals/[id]/intelligence/route.ts',
  'app/api/deals/[id]/route.ts',
  'app/api/sharing/public/[token]/route.ts',
  'app/api/sharing/[id]/route.ts',
  'app/api/templates/[id]/apply/route.ts',
  'app/api/templates/[id]/route.ts',
  'app/api/todos/[id]/route.ts',
];

files.forEach(file => {
  const filePath = path.join(process.cwd(), file);

  try {
    if (!fs.existsSync(filePath)) {
      console.log(`⚠ ${file} - file not found, skipping`);
      return;
    }

    let content = fs.readFileSync(filePath, 'utf8');
    const original = content;

    // Fix pattern: { params }: { params: { ... } } -> { params }: { params: Promise<{ ... }> }
    content = content.replace(
      /{ params }: { params: \{([^}]+)\} }/g,
      '{ params }: { params: Promise<{$1}> }'
    );

    // Add await params for each function
    content = content.replace(
      /export async function (GET|POST|PATCH|PUT|DELETE|HEAD)\s*\(\s*request: NextRequest,\s*{ params }: { params: Promise<\{([^}]+)\}> }\s*\)\s*{([^}]*?)(const \{?\s*([^}=]+)\s*\}?\s*= params;)?/g,
      (match, method, paramStr, funcBody, existingAwait) => {
        // If await is already there, don't add it again
        if (existingAwait && funcBody.includes('const { ')) {
          return match;
        }

        const paramNames = paramStr
          .split(',')
          .map(p => p.trim().split(':')[0].trim())
          .join(', ');

        return `export async function ${method}(
  request: NextRequest,
  { params }: { params: Promise<{${paramStr}}> }
) {
  const { ${paramNames} } = await params;${funcBody}`;
      }
    );

    // Replace params.id, params.token, etc. with the destructured variable
    const paramVars = ['id', 'token', 'dealId', 'seUserId'];
    paramVars.forEach(paramVar => {
      const regex = new RegExp(`params\\.${paramVar}`, 'g');
      content = content.replace(regex, paramVar);
    });

    if (content !== original) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`✓ ${file} - fixed`);
    } else {
      console.log(`⊘ ${file} - no changes needed`);
    }
  } catch (e) {
    console.error(`✗ ${file} - error:`, e.message);
  }
});

console.log('\n✅ Done!');
