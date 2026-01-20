import { PrismaClient } from "@prisma/client";


let prisma = new PrismaClient({
  errorFormat: 'minimal',

  log: [
      {
        emit: 'event',
        level: 'query',
      },
      {
        emit: 'stdout',
        level: 'error',
      },
      {
        emit: 'stdout',
        level: 'info',
      },
      {
        emit: 'stdout',
        level: 'warn',
      },
    ],
  
})
// prisma.$on('query', (event) => {
//     console.log('Query:', event.query); // Logs the raw SQL query
//     console.log('Params:', event.params); // Logs the parameters for the query
//     console.log('Duration:', event.duration, 'ms'); // Logs the execution time of the query
// });

//let prisma = new PrismaClient({log: ['query', 'info', 'warn', 'error']})

/* if (process.env.QUERY_PERFORMANCE_LOG)
  prisma.$use(async (params:any, next:any) => {
    const before = Date.now()

    const result = await next(params)

    const after = Date.now()

    console.log(`Query ${params.model}.${params.action} took ${after - before}ms`)

    return result
  }) */

  prisma.$on<any>('query', (e: any) => {
    let params: any[] = [];
    try {
      params = JSON.parse(e.params || "[]");
    } catch (err) {
      console.warn("⚠️ Cannot parse Prisma params:", e.params);
    }
  
    let i = 0;
    const combinedQuery = e.query.replace(/\?/g, () => {
      const param = params[i++];
      if (param === null || param === undefined) return "NULL";
      if (typeof param === "string") return `'${param}'`;
      return param;
    });
  
    console.log(" Combined Query:", combinedQuery);
    console.log(" Duration:", e.duration + "ms");

  

    // console.log('Combined Query:', combinedQuery);
    // console.log('Original Query:', e.query);
    // console.log('Params:', e.params);
    // console.log('Duration:', e.duration + 'ms');
});



//@ts-ignore
  //console.log(JSON.stringify(prisma._dmmf, getCircularReplacer()))

export default prisma;