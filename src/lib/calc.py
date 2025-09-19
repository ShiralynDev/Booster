import math

xp = 0
xp_anuncios = 30

for anuncios in range(1, xp_anuncios + 1):
    xp += (int) (xp_anuncios* (1 / anuncios))

print("xp maxima diaria:" , xp_anuncios * 4 + xp + 6 * 10)


MAU = 250e6 #suponiendo cantidad de usuarios que usa discord
percentage_usuarios_premium=0.03

#Anuncios
forzados_dia = 6
voluntarios_dia = 5

cpm_f = (3/1000)
cpm_v = (1.5)/1000

anuncios_forzados_dia = forzados_dia * (MAU * (1-percentage_usuarios_premium))
anuncios_voluntarios_dia = voluntarios_dia * (MAU * (1-percentage_usuarios_premium))

anuncios_forzados_mes = anuncios_forzados_dia * 30
anuncios_voluntarios_mes = anuncios_voluntarios_dia * 30

revenue = cpm_v * anuncios_voluntarios_mes * 0.9 + cpm_f * anuncios_forzados_mes * 0.25
print("revenue: " , revenue)
print("voluntarios:", cpm_v*anuncios_voluntarios_mes*0.9)
print("forzados:", cpm_f*anuncios_forzados_mes*0.25)

#premium
premium_users = MAU * percentage_usuarios_premium
premium_price=9.99
premium_revenue = premium_price * premium_users * (1-0.0295)

print("premium_ revenue", premium_revenue)
print("revenue_total: ", premium_revenue + revenue)

